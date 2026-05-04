import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { decodeCursor, encodeCursor, InvalidCursorError } from '../types/cursor.js';
import { getQuestionByUuid, searchQuestions } from '../repositories/questions.js';
import type { DifficultyBand } from '../types/question.js';
import { applyWatermark } from '../lib/watermark.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SearchQuerySchema = z.object({
  skill: z.string().min(1).max(100).optional(),
  sub_skill: z.string().min(1).max(100).optional(),
  format: z
    .enum([
      'mcq',
      'msq',
      'coding-fn',
      'coding-project',
      'sql',
      'sjt',
      'design',
      'casestudy',
      'video',
    ])
    .optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  language: z
    .string()
    .length(2)
    .regex(/^[a-z]{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().min(1).max(512).optional(),
});

export interface QuestionsRouterDeps {
  pool: Pool;
}

export function questionsRouter(deps: QuestionsRouterDeps): Router {
  const router = Router();

  router.get('/questions/search', async (req, res, next) => {
    let parsed;
    try {
      parsed = SearchQuerySchema.parse(req.query);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid query parameters',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    let cursor;
    if (parsed.cursor !== undefined) {
      try {
        cursor = decodeCursor(parsed.cursor);
      } catch (err) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: err instanceof InvalidCursorError ? err.message : 'Invalid cursor',
          }),
        );
        return;
      }
    }

    try {
      const result = await searchQuestions(deps.pool, {
        ...(parsed.skill !== undefined ? { skill: parsed.skill } : {}),
        ...(parsed.sub_skill !== undefined ? { subSkill: parsed.sub_skill } : {}),
        ...(parsed.format !== undefined ? { format: parsed.format } : {}),
        ...(parsed.difficulty !== undefined
          ? { difficulty: parsed.difficulty as DifficultyBand }
          : {}),
        ...(parsed.language !== undefined ? { language: parsed.language } : {}),
        ...(parsed.limit !== undefined ? { limit: parsed.limit } : {}),
        ...(cursor !== undefined ? { cursor } : {}),
      });

      // Repository returns next_cursor as raw JSON tuple; encode for the wire.
      let nextCursorEncoded: string | null = null;
      if (result.next_cursor !== null) {
        const tuple = JSON.parse(result.next_cursor) as { r: string; i: string };
        nextCursorEncoded = encodeCursor({ released_at: tuple.r, id: tuple.i });
      }

      res.status(200).json({
        questions: result.questions,
        next_cursor: nextCursorEncoded,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/questions/:uuid', async (req, res, next) => {
    const uuid = req.params.uuid;
    if (typeof uuid !== 'string' || !UUID_PATTERN.test(uuid)) {
      next(
        new HttpProblem({
          status: 400,
          title: 'Bad Request',
          detail: 'Question id must be a UUID',
        }),
      );
      return;
    }

    try {
      const question = await getQuestionByUuid(deps.pool, uuid);
      if (question === null) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: `Question ${uuid} does not exist or is not released`,
          }),
        );
        return;
      }
      // Per-candidate watermark: if ?candidate_id=<id> is present, apply a
      // deterministic option-permutation. Server keeps the keyMap implicitly
      // (re-derived at grade time via applyWatermark with the same inputs);
      // client sees only the watermarked options + watermark_seed for audit.
      const candidateId = typeof req.query.candidate_id === 'string' ? req.query.candidate_id : null;
      if (
        candidateId &&
        /^[A-Za-z0-9_-]{1,100}$/.test(candidateId) &&
        Array.isArray((question.body_json as { options?: unknown }).options)
      ) {
        const originalOptions = (question.body_json as { options: Array<{ key: string; text: string }> }).options;
        const wm = applyWatermark(question.uuid, candidateId, originalOptions);
        const newBodyJson = { ...question.body_json, options: wm.options };
        const watermarkedQuestion = {
          ...question,
          body_json: newBodyJson,
          watermark_seed: wm.watermarkSeed,
          watermarked_for: candidateId,
        };
        res.status(200).json(watermarkedQuestion);
        return;
      }
      res.status(200).json(question);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
