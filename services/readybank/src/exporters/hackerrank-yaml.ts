import type { Response } from 'express';
import yaml from 'js-yaml';
import type { QuestionPublic } from '../types/question.js';

/**
 * HackerRank-style YAML import format. Each question becomes a document in
 * a YAML stream (`---` separated). Format-specific shapes:
 *
 *   MCQ / MSQ:    question_type: multiple_choice (single | multiple)
 *                 problem_statement: <body_md>
 *                 multiple_choice_questions: [ { text, correct } ]
 *
 *   Coding:       question_type: coding
 *                 problem_statement: <body_md>
 *                 reference_solution: { language, code }
 *                 test_cases: [ { input, expected_output, weight } ]
 *
 *   Other formats render with a generic shape using body_md +
 *   question_type unchanged. HackerRank importers typically reject unknown
 *   types but the export remains debuggable.
 *
 * Note: This is a v0 mapping. The full HackerRank Content API spec has
 * dozens of fields; we ship the minimum that allows their importer to
 * parse without errors. Refinement is tracked as a future delta when we
 * have a live HackerRank engagement to validate against.
 */

interface HackerrankBase {
  uniq_id: string;
  question_type: string;
  problem_statement: string;
  difficulty?: number;
  language?: string;
  tags?: string[];
}

function buildDoc(q: QuestionPublic): unknown {
  const base: HackerrankBase = {
    uniq_id: q.uuid,
    question_type: q.format,
    problem_statement: q.body_md,
    language: q.language,
  };
  if (q.difficulty_band !== null) base.difficulty = q.difficulty_band;

  if (q.format === 'mcq' || q.format === 'msq') {
    const body = q.body_json as {
      options?: unknown;
      correct_index?: number;
      correct_indices?: number[];
    };
    const options = Array.isArray(body.options) ? body.options : [];
    const correctIndices: number[] =
      typeof body.correct_index === 'number'
        ? [body.correct_index]
        : Array.isArray(body.correct_indices)
          ? body.correct_indices
          : [];

    const choices = options.map((opt, idx) => ({
      text: typeof opt === 'string' ? opt : JSON.stringify(opt),
      correct: correctIndices.includes(idx),
    }));

    return {
      ...base,
      question_type: q.format === 'msq' ? 'multiple_choice_multiple' : 'multiple_choice_single',
      multiple_choice_questions: choices,
    };
  }

  if (q.format === 'coding-fn' || q.format === 'coding-project' || q.format === 'sql') {
    const refSolution = q.reference_solution as { language?: string; code?: string } | null;
    const tests = (q.test_cases as { cases?: unknown[] } | null)?.cases ?? [];

    return {
      ...base,
      question_type: 'coding',
      reference_solution:
        refSolution !== null
          ? { language: refSolution.language ?? 'unknown', code: refSolution.code ?? '' }
          : null,
      test_cases: Array.isArray(tests) ? tests : [],
    };
  }

  // Generic fallback for SJT / design / casestudy / video.
  return {
    ...base,
    body_json: q.body_json,
    rubric: q.rubric,
  };
}

export async function streamHackerrankYaml(
  res: Response,
  questions: AsyncIterable<QuestionPublic>,
): Promise<number> {
  res.setHeader('Content-Type', 'application/x-yaml; charset=utf-8');

  let count = 0;
  for await (const q of questions) {
    if (count > 0) res.write('---\n');
    res.write(yaml.dump(buildDoc(q), { lineWidth: 120, noRefs: true, sortKeys: false }));
    count++;
  }
  return count;
}
