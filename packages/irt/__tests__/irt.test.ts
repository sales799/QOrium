import { describe, expect, it } from 'vitest';
import {
  SO21_DEFAULTS,
  abilityProxyFromSumScore,
  calibrateItems,
  detectParameterDrift,
  estimateAbilityMle,
  mantelHaenszel,
  passesIrtAutoFail,
  prob2pl,
  prob3pl,
  probabilityProfile,
  sigmoid,
} from '../src/index.js';
import type { ItemResponse } from '../src/types.js';

// ─── Deterministic PRNG so tests are reproducible. ─────────────────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bernoulli(p: number, rng: () => number): 0 | 1 {
  return rng() < p ? 1 : 0;
}

describe('sigmoid + 3PL + 2PL probability', () => {
  it('sigmoid is monotone, bounded, and 0.5 at the origin', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 10);
    expect(sigmoid(-100)).toBeGreaterThanOrEqual(0);
    expect(sigmoid(-100)).toBeLessThan(1e-30);
    expect(sigmoid(100)).toBeLessThanOrEqual(1);
    expect(sigmoid(100)).toBeGreaterThan(0.999);
    expect(sigmoid(1)).toBeGreaterThan(sigmoid(0));
    expect(sigmoid(2)).toBeGreaterThan(sigmoid(1));
  });

  it('3PL collapses to 2PL when c = 0', () => {
    const params = { a: 1.5, b: 0.3, c: 0 };
    for (const t of [-2, -1, 0, 1, 2]) {
      expect(prob3pl(t, params)).toBeCloseTo(prob2pl(t, params.a, params.b), 12);
    }
  });

  it('3PL has lower asymptote at c when theta → -∞', () => {
    const params = { a: 1.5, b: 0.0, c: 0.2 };
    expect(prob3pl(-100, params)).toBeCloseTo(0.2, 10);
    expect(prob3pl(100, params)).toBeCloseTo(1, 8);
  });

  it('3PL midpoint identity: P(b) = (1 + c) / 2', () => {
    const params = { a: 1.2, b: -0.5, c: 0.2 };
    expect(prob3pl(params.b, params)).toBeCloseTo((1 + params.c) / 2, 12);
  });
});

describe('ability MLE', () => {
  it('estimates planted θ with bias < 0.5 over many synthetic panelists', () => {
    // Single-panelist MLE is noisy; aggregate over many panelists to get
    // a tight bias estimate. SE per panelist ~ 1/sqrt(I(θ)) ≈ 0.4 with
    // 30 calibrated items, so individual draws can swing by ±1; the
    // *bias* (mean error) over 50 panelists should be near zero.
    const rng = mulberry32(42);
    const trueTheta = 1.2;
    const items = Array.from({ length: 30 }, (_, i) => ({
      a: 0.8 + (i % 3) * 0.4,
      b: -2 + i * 0.13,
      c: 0,
    }));

    let sumTheta = 0;
    const N = 50;
    for (let p = 0; p < N; p++) {
      const responses = items.map((it) => ({
        correct: bernoulli(prob3pl(trueTheta, it), rng),
        params: it,
      }));
      sumTheta += estimateAbilityMle(responses).theta;
    }
    const meanTheta = sumTheta / N;
    expect(Math.abs(meanTheta - trueTheta)).toBeLessThan(0.5);
  });

  it('returns clamp value on degenerate all-correct / all-wrong patterns', () => {
    const params = { a: 1, b: 0, c: 0 };
    const allRight = Array.from({ length: 5 }, () => ({
      correct: 1 as const,
      params,
    }));
    const allWrong = Array.from({ length: 5 }, () => ({
      correct: 0 as const,
      params,
    }));
    expect(estimateAbilityMle(allRight).theta).toBe(4);
    expect(estimateAbilityMle(allWrong).theta).toBe(-4);
  });

  it('abilityProxyFromSumScore monotone in success rate', () => {
    expect(abilityProxyFromSumScore(0, 10)).toBeLessThan(abilityProxyFromSumScore(5, 10));
    expect(abilityProxyFromSumScore(5, 10)).toBeLessThan(abilityProxyFromSumScore(10, 10));
  });

  it('probabilityProfile vector matches scalar probs', () => {
    const params = [
      { a: 1, b: -1, c: 0 },
      { a: 1.5, b: 0, c: 0 },
      { a: 0.7, b: 1.2, c: 0.1 },
    ];
    const v = probabilityProfile(0.5, params);
    expect(v[0]).toBeCloseTo(prob3pl(0.5, params[0]!), 12);
    expect(v[1]).toBeCloseTo(prob3pl(0.5, params[1]!), 12);
    expect(v[2]).toBeCloseTo(prob3pl(0.5, params[2]!), 12);
  });
});

describe('JMLE-style 2PL calibration on synthetic data', () => {
  it('recovers planted b within reasonable error on N=500 panelists × 8 items', () => {
    const rng = mulberry32(2024);
    const trueParams = [
      { a: 1.0, b: -1.5, c: 0 },
      { a: 1.2, b: -0.8, c: 0 },
      { a: 0.9, b: -0.3, c: 0 },
      { a: 1.5, b: 0.0, c: 0 },
      { a: 1.1, b: 0.5, c: 0 },
      { a: 1.3, b: 1.0, c: 0 },
      { a: 0.8, b: 1.5, c: 0 },
      { a: 1.0, b: 0.2, c: 0 },
    ];
    const N = 500;
    const abilities = Array.from({ length: N }, () => normalSample(rng));

    const responses: ItemResponse[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < trueParams.length; j++) {
        const p = prob3pl(abilities[i]!, trueParams[j]!);
        responses.push({
          panelistId: `p-${i}`,
          questionId: `q-${j}`,
          correct: bernoulli(p, rng),
        });
      }
    }

    const fits = calibrateItems(responses, { minN: 30, maxIter: 25 });
    expect(fits.length).toBe(trueParams.length);

    let bErrors = 0;
    for (let j = 0; j < trueParams.length; j++) {
      const fit = fits.find((r) => r.questionId === `q-${j}`)!;
      const truth = trueParams[j]!;
      // b (location) is well-identified at this N; assert tight bound.
      expect(Math.abs(fit.params.b - truth.b)).toBeLessThan(0.7);
      if (Math.abs(fit.params.b - truth.b) > 0.4) bErrors += 1;
      // a (slope) is harder to identify with N=200; just assert it's in
      // a sane positive range — recovering it precisely needs N >= 500
      // and is not what SO-21 gates on.
      expect(fit.params.a).toBeGreaterThanOrEqual(0.1);
      expect(fit.params.a).toBeLessThanOrEqual(3.0);
      // Pass-rate sanity.
      expect(fit.empiricalPassRate).toBeGreaterThan(0);
      expect(fit.empiricalPassRate).toBeLessThan(1);
    }
    // At most a quarter of items can drift outside the tighter b band.
    expect(bErrors).toBeLessThanOrEqual(2);
  });

  it('respects (a, b) bounds even with extreme inputs', () => {
    const rng = mulberry32(7);
    const responses: ItemResponse[] = [];
    for (let i = 0; i < 50; i++) {
      // All-correct answers from the entire panel.
      responses.push({ panelistId: `p-${i}`, questionId: 'q-extreme', correct: 1 });
    }
    // Add one wrong so passRate isn't exactly 1 — doesn't matter for bounds.
    responses[0]!.correct = 0;

    const fits = calibrateItems(responses, { minN: 30 });
    const fit = fits[0]!;
    expect(fit.params.a).toBeLessThanOrEqual(3.0);
    expect(fit.params.a).toBeGreaterThanOrEqual(0.1);
    expect(fit.params.b).toBeGreaterThanOrEqual(-4);
    expect(fit.params.b).toBeLessThanOrEqual(4);
    void rng;
  });
});

describe('Mantel-Haenszel DIF', () => {
  it('reports near-zero D-MH when reference and focal share the same model', () => {
    const rng = mulberry32(99);
    const params = { a: 1.2, b: 0.0, c: 0 };
    const ref: Array<{ panelistId: string; correct: 0 | 1; ability: number }> = [];
    const foc: Array<{ panelistId: string; correct: 0 | 1; ability: number }> = [];
    for (let i = 0; i < 200; i++) {
      const ability = normalSample(rng);
      ref.push({
        panelistId: `r-${i}`,
        correct: bernoulli(prob3pl(ability, params), rng),
        ability,
      });
    }
    for (let i = 0; i < 200; i++) {
      const ability = normalSample(rng);
      foc.push({
        panelistId: `f-${i}`,
        correct: bernoulli(prob3pl(ability, params), rng),
        ability,
      });
    }
    const result = mantelHaenszel('q-1', ref, foc, { strata: 5 });
    expect(Math.abs(result.dmh)).toBeLessThan(1.0);
    expect(result.n).toBe(400);
    expect(result.strata).toBe(5);
  });

  it('flags a deliberately biased item with |D-MH| > 1.0', () => {
    const rng = mulberry32(123);
    const refParams = { a: 1.2, b: -0.3, c: 0 };
    const focParams = { a: 1.2, b: 0.7, c: 0 }; // 1.0 unit harder for focal
    const ref: Array<{ panelistId: string; correct: 0 | 1; ability: number }> = [];
    const foc: Array<{ panelistId: string; correct: 0 | 1; ability: number }> = [];
    for (let i = 0; i < 300; i++) {
      const ability = normalSample(rng);
      ref.push({
        panelistId: `r-${i}`,
        correct: bernoulli(prob3pl(ability, refParams), rng),
        ability,
      });
    }
    for (let i = 0; i < 300; i++) {
      const ability = normalSample(rng);
      foc.push({
        panelistId: `f-${i}`,
        correct: bernoulli(prob3pl(ability, focParams), rng),
        ability,
      });
    }
    const result = mantelHaenszel('q-biased', ref, foc, { strata: 5 });
    expect(Math.abs(result.dmh)).toBeGreaterThan(1.0);
  });
});

describe('SO-21 quality gate', () => {
  it('passes a healthy item', () => {
    const r = passesIrtAutoFail({
      questionId: 'q-good',
      params: { a: 1.2, b: 0.1, c: 0 },
      n: 60,
      empiricalPassRate: 0.55,
      converged: true,
      negLogLikelihood: 30,
    });
    expect(r.passed).toBe(true);
    expect(r.reasons).toEqual([]);
  });

  it('fails for under-sample', () => {
    const r = passesIrtAutoFail({
      questionId: 'q-low-n',
      params: { a: 1.2, b: 0.1, c: 0 },
      n: 12,
      empiricalPassRate: 0.5,
      converged: true,
      negLogLikelihood: 30,
    });
    expect(r.passed).toBe(false);
    expect(r.reasons.join(';')).toContain('n=12');
  });

  it('fails for low discrimination, high pass rate, out-of-band b', () => {
    const r = passesIrtAutoFail({
      questionId: 'q-bad',
      params: { a: 0.2, b: 5, c: 0 },
      n: 100,
      empiricalPassRate: 0.99,
      converged: true,
      negLogLikelihood: 30,
    });
    expect(r.passed).toBe(false);
    expect(r.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('SO21_DEFAULTS sets minN=30 per spec §3', () => {
    expect(SO21_DEFAULTS.minN).toBe(30);
  });
});

describe('parameter drift detection', () => {
  it('reports no drift when parameters are stable', () => {
    const out = detectParameterDrift({ a: 1.2, b: 0.0, c: 0 }, { a: 1.25, b: 0.1, c: 0 });
    expect(out.drift).toBe(false);
  });

  it('flags drift when |Δb| > 0.5 per spec §4', () => {
    const out = detectParameterDrift({ a: 1.2, b: 0.0, c: 0 }, { a: 1.25, b: 0.7, c: 0 });
    expect(out.drift).toBe(true);
    expect(out.reasons.some((r) => r.includes('|Δb|'))).toBe(true);
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────
function normalSample(rng: () => number): number {
  // Box-Muller — clamp to [-3, 3] to keep the synthetic ability range
  // tractable.
  let u1 = rng();
  if (u1 < 1e-12) u1 = 1e-12;
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(-3, Math.min(3, z));
}
