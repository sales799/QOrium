import type { ChatbotResponse, Citation } from './types.js';

export type ClassifiedIntent =
  | { kind: 'pricing_quote' }
  | { kind: 'candidate_cheat_help' }
  | { kind: 'competitor_disparagement'; competitor: string }
  | { kind: 'roadmap_ai_interviewer' }
  | { kind: 'talk_to_human' }
  | { kind: 'general' };

const RESPONSIBLE_AI_CITATION: Citation = {
  id: 'responsible-ai-roadmap',
  title: 'Responsible AI',
  url: '/responsible-ai',
  excerpt: 'Shipped, beta, and roadmap capabilities are separated by the honesty table.',
};

const COMPETITOR_SLUGS = new Map<string, string>([
  ['hackerrank', 'qorium-vs-hackerrank'],
  ['vervoe', 'qorium-vs-vervoe'],
  ['mercer mettl', 'qorium-vs-mercer-mettl'],
  ['mettl', 'qorium-vs-mercer-mettl'],
  ['imocha', 'qorium-vs-imocha'],
  ['coderbyte', 'qorium-vs-coderbyte'],
]);

export function classifyIntent(message: string): ClassifiedIntent {
  const text = message.toLowerCase();

  if (/\b(price|pricing|cost|quote|quotation|how much|plan)\b/.test(text)) {
    return { kind: 'pricing_quote' };
  }

  if (/\b(cheat|hack|bypass|give me answers|help me pass|solve my test)\b/.test(text)) {
    return { kind: 'candidate_cheat_help' };
  }

  if (/\b(ai interviewer|astra|live ai interview)\b/.test(text)) {
    return { kind: 'roadmap_ai_interviewer' };
  }

  if (/\b(talk to human|human|sales person|representative|call me|contact me)\b/.test(text)) {
    return { kind: 'talk_to_human' };
  }

  if (/\b(terrible|bad|awful|trash|worse|suck|sucks|scam)\b/.test(text)) {
    for (const competitor of COMPETITOR_SLUGS.keys()) {
      if (text.includes(competitor)) return { kind: 'competitor_disparagement', competitor };
    }
  }

  return { kind: 'general' };
}

export function policyReplyForIntent(intent: ClassifiedIntent): ChatbotResponse | undefined {
  switch (intent.kind) {
    case 'pricing_quote':
      return {
        intent: 'lead_capture',
        reply:
          'QOrium does not quote pricing inside the chatbot. Share your work email, company, role, and one-line need, and sales will route the right plan.',
        citations: [],
        escalate: true,
      };
    case 'candidate_cheat_help':
      return {
        intent: 'refusal',
        reply:
          'I cannot help with cheating, bypassing, or leaking assessment answers. I can explain QOrium rules, candidate instructions, and fairness safeguards.',
        citations: [],
      };
    case 'roadmap_ai_interviewer':
      return {
        intent: 'roadmap',
        reply:
          "No. QOrium's AI Interviewer is on the roadmap, not a shipped marketing-site capability. The current shipped scope is evidence-led assessment content, trust pages, and cited buyer guidance.",
        citations: [RESPONSIBLE_AI_CITATION],
      };
    case 'competitor_disparagement': {
      const slug = COMPETITOR_SLUGS.get(intent.competitor) ?? 'qorium-vs-vervoe';
      const citation: Citation = {
        id: `compare-${slug}`,
        title: 'QOrium comparison page',
        url: `/compare/${slug}`,
        excerpt: 'Competitor comparisons name strengths first and avoid disparagement.',
      };
      return {
        intent: 'comparison_redirect',
        reply:
          'I will not disparage competitors. For a fair, sourced comparison, use the relevant QOrium comparison page.',
        citations: [citation],
      };
    }
    case 'talk_to_human':
      return {
        intent: 'human_escalation',
        reply:
          'A human can help. Share your work email, company, role, and one-line need, and the QOrium team will follow up within 4 business hours.',
        citations: [],
        escalate: true,
      };
    case 'general':
      return undefined;
  }
}
