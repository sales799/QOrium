# CTO-DELTA: JD-Forge role-graph mapping uses string-similarity in v0; embedding-based mapping deferred

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/JD-Forge-v0-Design.md` §3.2 (Stage 2 — Role-Graph Mapping)

## Background

§3.2 calls for embedding-cosine matching ≥0.8 between extracted JD skills
and `content.sub_skills` rows, with fuzzy string match as a fallback. The
embedding path requires:

- An embeddings API (Anthropic Embeddings or OpenAI text-embedding-3) with
  a per-call cost
- A vector store (pgvector extension or a dedicated Qdrant instance)
- A weekly batch job that re-embeds `content.sub_skills` rows (or
  on-write triggers)
- An offline calibration of the 0.8 cosine threshold against a manually-
  curated set of "skill X should map to canonical Y" tuples

…all of which is queued for Sprint ≥2.x once at least one of (a) the
content-engine pipeline produces a steady stream of new sub-skills, or
(b) the JD-Forge customer pipeline volume justifies the embedding-batch
ops cost.

## Adaptation in v0

`services/jd-forge/src/mapper.ts` ships a `StringMatchRoleGraphMapper`:

- Tokenises the canonical name + alias list into character bigrams
- Computes Dice coefficient between the JD-extracted skill and each
  canonical entry
- Accepts the highest-scoring match if it clears `ACCEPT_THRESHOLD = 0.55`
  (calibrated against the spec's "embedding cosine ≥ 0.8" intent;
  string Dice is more lenient at the same conceptual confidence)
- Returns `matchKind: 'fuzzy'` for accepted matches, `'unmapped'` otherwise

The `RoleGraphMapper` interface is intentionally narrow:

```
interface RoleGraphMapper {
  match(skill: string): Promise<{ subSkillId: string | null; score: number; kind: ... }>;
}
```

So when the embedding-based implementation is ready, it slots in as
`EmbeddingRoleGraphMapper` and the orchestrator boot logic becomes a
single env-var conditional.

## Why string-similarity is acceptable for v0

- **Wave 1 corpus is small** (~25 coding questions across 8 roles); the
  canonical sub-skill list is hand-authored and uses recognisable names
  (`Salesforce Apex`, `SOQL`, `React`).
- **Customer JDs use the same vocabulary** (the spec's example JD is
  literally "Senior Salesforce Developer with Lightning Web Components,
  Apex, SOQL"). String overlap captures these matches reliably.
- **Unmapped-skill graceful degradation**: when the mapper returns
  `unmapped`, the spec generator still uses the JD's raw skill name as
  the `skillSource`. The downstream generator (Anthropic or stub) can
  still produce a question — the only loss is the canonical-sub-skill
  lineage (which the testforge-orchestrator's pre-calibration prior
  uses for nearest-neighbor; missing it just means we fall back to
  the format default).

## Reconciliation request to CTO Office

Three options:

1. **Ratify v0 string-match** (recommended). Pros: zero infra cost; works
   for Wave 1 / Wave 2 vocabulary; the embedding swap is a one-file change.
2. **Block v0 on embeddings** — bring pgvector + an embedding-API budget
   - the calibration pass. Cons: drags Phase 2 schedule; embedding cost
     per JD pack is small but non-zero.
3. **Hybrid** — string-match for required skills (high-precision
   vocabulary); embedding-match for nice-to-have skills (where customer
   JDs are more idiosyncratic). Defensible but doubles the pluggability
   surface for ~10% more accuracy in v0.

Default action if no reconciliation by next sprint review: **option 1**.
The embedding upgrade ships in Sprint ≥2.x alongside whatever first
needs vector search at scale (likely the Anti-Leak Engine's cosine
channel from `infra/Anti-Leak-Engine-v0-Design.md` §2.2).

## Verification

`services/jd-forge/__tests__/mapper.test.ts`:

- 5 cases against `StringMatchRoleGraphMapper` (exact name, near match,
  unrelated skill, empty input, empty canonical list)
- 2 cases against `mapJdSkills` (segregates mapped vs unmapped required;
  doesn't segregate nice-to-have items)

The orchestrator integration tests use the string-match mapper with a
2-entry canonical list (Salesforce Apex + SOQL); the JD-Forge end-to-end
flow exercises the unmapped-required + format-default fallback path
implicitly.
