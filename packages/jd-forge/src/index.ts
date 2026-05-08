/**
 * @qorium/jd-forge — SKU 2 alpha library.
 *
 * Pure deterministic pieces of the JD-Forge pipeline that can ship and
 * test without an LLM API key. The cred-bound LLM call lives in
 * services/jd-forge (deferred until ANTHROPIC_API_KEY drops).
 *
 * Pipeline (per infra/JD-Forge-v0-Design.md):
 *   1. parseJobDescription(jdText, llmExtractor) → ParsedJobDescription
 *   2. mapRoleToSubSkills(parsed) → MappingResult
 *   3. buildGenerationSpec(mapping, jdMeta, opts) → GenerationSpec
 *   4. (LLM authors questions, cred-bound)
 *   5. exportQuestions(drafts, format) → string
 */

export * from './types.js';
export * from './parsing/jd-parser.js';
export * from './role-graph/mapper.js';
export * from './generation/spec-builder.js';
export * from './output/exporters.js';
