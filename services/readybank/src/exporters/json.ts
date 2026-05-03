import type { Response } from 'express';
import type { QuestionPublic } from '../types/question.js';
import type { PackRow } from '../repositories/packs.js';

/**
 * Stream a JSON export — single document of shape:
 *   { pack: { id, name, ... }, questions: [ ... ] }
 *
 * The `questions` array is streamed lazily so even pack-size capped at
 * 100 questions never buffers all bodies in memory.
 */

export async function streamJson(
  res: Response,
  pack: PackRow,
  questions: AsyncIterable<QuestionPublic>,
): Promise<number> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const header = {
    id: pack.id,
    name: pack.name,
    filters: pack.filters,
    question_count: pack.question_count,
    created_at: pack.created_at.toISOString(),
    expires_at: pack.expires_at !== null ? pack.expires_at.toISOString() : null,
  };

  res.write(`{"pack":${JSON.stringify(header)},"questions":[`);

  let count = 0;
  for await (const q of questions) {
    if (count > 0) res.write(',');
    res.write(JSON.stringify(q));
    count++;
  }
  res.write(']}');
  return count;
}
