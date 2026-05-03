/**
 * Five-stage JD-Forge pipeline orchestrator. Pure dependency injection on
 * every external surface — parsers, mappers, generators, validators are
 * passed in by the caller (real impls in prod; stubs in tests).
 */

import type { Logger } from 'pino';
import { exportFor } from './exporters.js';
import type { JdParser } from './parser.js';
import { mapJdSkills, type RoleGraphMapper } from './mapper.js';
import { buildSpec } from './spec.js';
import type { AIQuestionGenerator } from './generator.js';
import { isLikelyLeak, validateQuestion } from './validator.js';
import type {
  GeneratedQuestion,
  OrderInput,
  OrderOutcome,
  ParsedJd,
  QuestionSpecItem,
} from './types.js';

export interface OrchestratorPipeline {
  parser: JdParser;
  mapper: RoleGraphMapper;
  generator: AIQuestionGenerator;
  logger: Logger;
  /** Optional clock override for tests. */
  now?: () => Date;
  /** Optional max retries per question (default 1 per spec §3.5). */
  maxRetriesPerQuestion?: number;
}

const DEFAULT_MAX_RETRIES = 1;

export async function runOrder(
  pipeline: OrchestratorPipeline,
  order: OrderInput,
): Promise<OrderOutcome> {
  const { parser, mapper, generator, logger } = pipeline;
  const maxRetries = pipeline.maxRetriesPerQuestion ?? DEFAULT_MAX_RETRIES;

  let parsedJd: ParsedJd;
  try {
    parsedJd = await parser.parse(order.jdText);
  } catch (err) {
    logger.error({ err, orderId: order.orderId }, 'JD parse failed');
    return failed(order, 'parse_failed', err);
  }

  let mapping;
  try {
    mapping = await mapJdSkills(mapper, parsedJd.requiredSkills, parsedJd.niceToHaveSkills);
  } catch (err) {
    logger.error({ err, orderId: order.orderId }, 'role-graph mapping failed');
    return failed(order, 'mapping_failed', err, parsedJd);
  }

  const totalQuestions = order.totalQuestions ?? 20;
  const spec = buildSpec(mapping, { totalQuestions });
  if (spec.items.length === 0) {
    logger.warn({ orderId: order.orderId }, 'spec generation produced no items');
    return {
      orderId: order.orderId,
      status: 'failed',
      parsedJd,
      mapping,
      spec,
      questions: [],
      rejectedCount: 0,
      failureReason: 'no_questions_in_spec',
    };
  }

  const generationResults = await Promise.all(
    spec.items.map((item) => generateOneWithRetries(generator, item, parsedJd, maxRetries)),
  );

  const questions: GeneratedQuestion[] = [];
  let rejectedCount = 0;
  for (const result of generationResults) {
    if (!result) {
      rejectedCount++;
      continue;
    }
    if (isLikelyLeak(result)) {
      rejectedCount++;
      logger.warn({ questionId: result.id }, 'leak heuristic rejected question');
      continue;
    }
    const validation = validateQuestion(result, order.tier);
    if (validation.verdict === 'reject' || validation.verdict === 'regenerate') {
      // For 'regenerate' v0 simply rejects (we already retried inside
      // generateOneWithRetries); a real implementation would run another
      // round-trip with stricter prompts.
      rejectedCount++;
      logger.debug(
        { questionId: result.id, reasons: validation.reasons, verdict: validation.verdict },
        'question rejected at validator',
      );
      continue;
    }
    questions.push(result);
  }

  if (questions.length === 0) {
    return {
      orderId: order.orderId,
      status: 'failed',
      parsedJd,
      mapping,
      spec,
      questions: [],
      rejectedCount,
      failureReason: 'all_questions_rejected',
    };
  }

  let exportPayload: string | undefined;
  let exportContentType: string | undefined;
  try {
    const exported = exportFor(order.exportFormat, order, parsedJd, questions);
    exportPayload = exported.body;
    exportContentType = exported.contentType;
  } catch (err) {
    logger.error({ err, orderId: order.orderId }, 'export failed');
    return {
      orderId: order.orderId,
      status: 'failed',
      parsedJd,
      mapping,
      spec,
      questions,
      rejectedCount,
      failureReason: err instanceof Error ? err.message : String(err),
    };
  }

  const outcome: OrderOutcome = {
    orderId: order.orderId,
    status: 'completed',
    parsedJd,
    mapping,
    spec,
    questions,
    rejectedCount,
  };
  if (exportPayload !== undefined) outcome.exportPayload = exportPayload;
  if (exportContentType !== undefined) outcome.exportContentType = exportContentType;
  return outcome;
}

async function generateOneWithRetries(
  generator: AIQuestionGenerator,
  item: QuestionSpecItem,
  context: ParsedJd,
  maxRetries: number,
): Promise<GeneratedQuestion | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const outcome = await generator.generate(item, context);
    if (outcome.question) return outcome.question;
  }
  return null;
}

function failed(
  order: OrderInput,
  reason: string,
  err: unknown,
  parsedJd: ParsedJd | null = null,
): OrderOutcome {
  return {
    orderId: order.orderId,
    status: 'failed',
    parsedJd,
    mapping: null,
    spec: null,
    questions: [],
    rejectedCount: 0,
    failureReason: `${reason}: ${err instanceof Error ? err.message : String(err)}`,
  };
}
