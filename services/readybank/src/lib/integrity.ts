// Pure proctoring / integrity summariser over per-response suspicious_signals.
// No DB, no I/O. Deterministic and unit-testable. Slice 1 of N10 proctoring:
// the candidate portal already records anti-cheat counters
// (tab_switches / paste_events / focus_loss / fullscreen_exits) into
// content.responses.suspicious_signals; this turns those raw counters into a
// single attempt-level integrity risk summary for recruiter/admin review.

export type IntegritySignals = Record<string, unknown>;

export interface IntegritySummary {
  total: number;
  by_type: Record<string, number>;
  risk_score: number; // 0..100
  risk_level: 'low' | 'medium' | 'high';
  flagged: boolean;
}

// Weight per known anti-cheat counter. Unknown numeric keys default to 4 so a
// new client-side signal still contributes to risk without a code change.
const WEIGHTS: Record<string, number> = {
  tab_switches: 8,
  fullscreen_exits: 10,
  paste_events: 6,
  focus_loss: 3,
};
const DEFAULT_WEIGHT = 4;
const MEDIUM_THRESHOLD = 25;
const HIGH_THRESHOLD = 60;

function toCount(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.floor(v);
  if (Array.isArray(v)) return v.length;
  if (v === true) return 1;
  return 0;
}

export function summarizeIntegrity(
  signals: ReadonlyArray<IntegritySignals | null | undefined>,
): IntegritySummary {
  const byType: Record<string, number> = {};
  for (const sig of signals) {
    if (!sig || typeof sig !== 'object') continue;
    for (const [key, raw] of Object.entries(sig)) {
      const n = toCount(raw);
      if (n > 0) byType[key] = (byType[key] ?? 0) + n;
    }
  }
  let total = 0;
  let weighted = 0;
  for (const [key, n] of Object.entries(byType)) {
    total += n;
    weighted += n * (WEIGHTS[key] ?? DEFAULT_WEIGHT);
  }
  const riskScore = Math.min(100, weighted);
  const riskLevel: IntegritySummary['risk_level'] =
    riskScore >= HIGH_THRESHOLD ? 'high' : riskScore >= MEDIUM_THRESHOLD ? 'medium' : 'low';
  return {
    total,
    by_type: byType,
    risk_score: riskScore,
    risk_level: riskLevel,
    flagged: riskScore >= MEDIUM_THRESHOLD,
  };
}
