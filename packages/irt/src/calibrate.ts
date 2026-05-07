import { abilityProxyFromSumScore, estimateAbilityMle } from './ability.js';
import { prob3pl, sigmoid } from './probability.js';
import type { CalibrationResult, IrtParams, ItemResponse } from './types.js';

const DEFAULT_PRIOR: IrtParams = { a: 1.0, b: 0.0, c: 0.0 };

/** Bounded JMLE-style 2PL calibration. Iterates between (1) ability
 *  estimation given current item params and (2) coordinate-descent on item
 *  params (a, b) given current abilities. We keep c at the prior because
 *  3PL c-fitting needs N >> 30 to be stable; spec §3 is fine with that.
 *
 *  Inputs are a long-form response set per item; the caller groups into
 *  items via the questionId field. */
export function calibrateItems(
  responses: ReadonlyArray<ItemResponse>,
  options: {
    minN?: number;
    maxIter?: number;
    tol?: number;
    aBounds?: [number, number];
    bBounds?: [number, number];
    cPrior?: number;
    prior?: IrtParams;
  } = {},
): CalibrationResult[] {
  const minN = options.minN ?? 30;
  const maxIter = options.maxIter ?? 30;
  const tol = options.tol ?? 1e-4;
  const aMin = options.aBounds?.[0] ?? 0.1;
  const aMax = options.aBounds?.[1] ?? 3.0;
  const bMin = options.bBounds?.[0] ?? -4;
  const bMax = options.bBounds?.[1] ?? 4;
  const cPrior = options.cPrior ?? 0;
  const priorParams = options.prior ?? { ...DEFAULT_PRIOR, c: cPrior };

  // Group responses by panelist and by item.
  const byPanelist = new Map<string, ItemResponse[]>();
  const byItem = new Map<string, ItemResponse[]>();
  for (const r of responses) {
    if (!byPanelist.has(r.panelistId)) byPanelist.set(r.panelistId, []);
    byPanelist.get(r.panelistId)!.push(r);
    if (!byItem.has(r.questionId)) byItem.set(r.questionId, []);
    byItem.get(r.questionId)!.push(r);
  }

  // Initial item parameters: prior. Initial abilities: sum-score proxy per
  // panelist.
  const itemParams = new Map<string, IrtParams>();
  for (const [qid] of byItem) itemParams.set(qid, { ...priorParams });

  const abilities = new Map<string, number>();
  for (const [pid, rs] of byPanelist) {
    const sum = rs.reduce((s, r) => s + r.correct, 0);
    abilities.set(pid, abilityProxyFromSumScore(sum, rs.length));
  }

  // Iterate.
  for (let iter = 0; iter < maxIter; iter++) {
    let maxParamMove = 0;

    // Step 1: refine each panelist's ability from item params.
    for (const [pid, rs] of byPanelist) {
      const profile = rs.map((r) => ({
        correct: r.correct,
        params: itemParams.get(r.questionId) ?? priorParams,
      }));
      const { theta } = estimateAbilityMle(profile);
      abilities.set(pid, theta);
    }

    // Identification constraint: 2PL is identified up to location AND
    // scale. Anchor abilities to mean 0, sd 1 each pass; b's shift by
    // -mean and a's & b's both rescale by sd so the joint likelihood is
    // invariant. Without this anchor JMLE can drift to the bounds.
    let abilityMean = 0;
    for (const t of abilities.values()) abilityMean += t;
    abilityMean /= Math.max(abilities.size, 1);
    let abilityVar = 0;
    for (const t of abilities.values()) {
      const d = t - abilityMean;
      abilityVar += d * d;
    }
    abilityVar /= Math.max(abilities.size, 1);
    const abilitySd = Math.sqrt(Math.max(abilityVar, 1e-9));
    if (Math.abs(abilityMean) > 1e-6 || Math.abs(abilitySd - 1) > 1e-6) {
      for (const [pid, t] of abilities) {
        abilities.set(pid, (t - abilityMean) / abilitySd);
      }
      // Rescale items so that the linear predictor a * (theta - b) is
      // preserved: theta_new = (theta - mean) / sd  ⇒  a_new = a * sd,
      // b_new = (b - mean) / sd.
      for (const [qid, p] of itemParams) {
        const aNew = Math.min(Math.max(p.a * abilitySd, aMin), aMax);
        const bNew = Math.min(Math.max((p.b - abilityMean) / abilitySd, bMin), bMax);
        itemParams.set(qid, { a: aNew, b: bNew, c: p.c });
      }
    }

    // Step 2: refit each item's (a, b) given current abilities.
    for (const [qid, rs] of byItem) {
      if (rs.length < 1) continue;
      const cur = itemParams.get(qid) ?? priorParams;
      const next = fit2plOneItem(rs, abilities, cur, { aMin, aMax, bMin, bMax });
      const move = Math.abs(next.a - cur.a) + Math.abs(next.b - cur.b);
      if (move > maxParamMove) maxParamMove = move;
      itemParams.set(qid, next);
    }

    if (maxParamMove < tol) break;
  }

  // Build results.
  const results: CalibrationResult[] = [];
  for (const [qid, rs] of byItem) {
    const params = itemParams.get(qid) ?? priorParams;
    const empiricalPassRate = rs.length > 0 ? rs.reduce((s, r) => s + r.correct, 0) / rs.length : 0;
    const negLL = negLogLikelihoodForItem(rs, abilities, params);
    results.push({
      questionId: qid,
      params,
      n: rs.length,
      empiricalPassRate,
      converged: rs.length >= minN,
      negLogLikelihood: negLL,
    });
  }
  return results;
}

/** One-item 2PL coordinate descent: alternate 1D Newton on b (well-
 *  identified by the location of the inflection point) and 1D Newton on
 *  log-a (parameterized in log-space so positivity is automatic). More
 *  robust than 2D Newton when the cross-curvature is small. */
function fit2plOneItem(
  rs: ReadonlyArray<ItemResponse>,
  abilities: ReadonlyMap<string, number>,
  cur: IrtParams,
  bounds: { aMin: number; aMax: number; bMin: number; bMax: number },
): IrtParams {
  let { a, b } = cur;
  const c = cur.c;
  const stepCap = 1.0;

  for (let inner = 0; inner < 12; inner++) {
    // 1D Newton on b — gradient and Fisher info.
    let gB = 0;
    let iB = 0;
    for (const r of rs) {
      const theta = abilities.get(r.panelistId) ?? 0;
      const z = a * (theta - b);
      const p2 = sigmoid(z);
      const p = c + (1 - c) * p2;
      const pSafe = Math.min(Math.max(p, 1e-9), 1 - 1e-9);
      const w = (1 - c) * p2 * (1 - p2);
      const dlogL_dz = (w * (r.correct - pSafe)) / (pSafe * (1 - pSafe));
      gB += dlogL_dz * -a;
      const fz = (w * w) / (pSafe * (1 - pSafe));
      iB += fz * a * a;
    }
    if (iB > 1e-9) {
      let stepB = gB / iB;
      if (stepB > stepCap) stepB = stepCap;
      if (stepB < -stepCap) stepB = -stepCap;
      b += stepB;
      if (b < bounds.bMin) b = bounds.bMin;
      if (b > bounds.bMax) b = bounds.bMax;
    }

    // 1D Newton on log-a.
    let gLogA = 0;
    let iLogA = 0;
    for (const r of rs) {
      const theta = abilities.get(r.panelistId) ?? 0;
      const z = a * (theta - b);
      const p2 = sigmoid(z);
      const p = c + (1 - c) * p2;
      const pSafe = Math.min(Math.max(p, 1e-9), 1 - 1e-9);
      const w = (1 - c) * p2 * (1 - p2);
      const dlogL_dz = (w * (r.correct - pSafe)) / (pSafe * (1 - pSafe));
      // dz/d(log a) = a * (theta - b)
      gLogA += dlogL_dz * a * (theta - b);
      const fz = (w * w) / (pSafe * (1 - pSafe));
      iLogA += fz * (a * (theta - b)) * (a * (theta - b));
    }
    if (iLogA > 1e-9) {
      let stepLogA = gLogA / iLogA;
      if (stepLogA > stepCap) stepLogA = stepCap;
      if (stepLogA < -stepCap) stepLogA = -stepCap;
      a = a * Math.exp(stepLogA);
      if (a < bounds.aMin) a = bounds.aMin;
      if (a > bounds.aMax) a = bounds.aMax;
    }
  }

  return { a, b, c };
}

function negLogLikelihoodForItem(
  rs: ReadonlyArray<ItemResponse>,
  abilities: ReadonlyMap<string, number>,
  params: IrtParams,
): number {
  let nll = 0;
  for (const r of rs) {
    const theta = abilities.get(r.panelistId) ?? 0;
    const p = prob3pl(theta, params);
    const eps = 1e-12;
    const pSafe = Math.min(Math.max(p, eps), 1 - eps);
    nll += -(r.correct ? Math.log(pSafe) : Math.log(1 - pSafe));
  }
  return nll;
}
