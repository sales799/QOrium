import { z } from "zod";
import type { LibraryQuestion } from "@qorium/taxonomy";

const gradeSchema = z.object({
  score: z.number().min(0).max(1),
  reasoning: z.string().min(10),
  confidence: z.number().min(0).max(1)
});

export interface GradeInput {
  question: LibraryQuestion;
  response: unknown;
}

export interface GradeResult {
  score: number;
  reasoning: string;
  confidence: number;
}

export async function gradeAnswer(input: GradeInput): Promise<GradeResult> {
  if (process.env.OPENROUTER_API_KEY) {
    return gradeWithOpenRouter(input);
  }
  return gradeLocally(input);
}

function gradeLocally(input: GradeInput): GradeResult {
  const { question, response } = input;
  if (question.type === "mcq") {
    const score = response === question.correctAnswer ? 1 : 0;
    return {
      score,
      reasoning: score === 1 ? "Selected the expected option for the keyed MCQ." : "Selected option does not match the keyed answer.",
      confidence: 0.92
    };
  }
  if (question.type === "multi-select") {
    const expected = JSON.stringify(question.correctAnswer);
    const actual = JSON.stringify(response);
    return {
      score: expected === actual ? 1 : 0,
      reasoning: expected === actual ? "Selected set matches the keyed multi-select answer." : "Selected set misses at least one keyed option.",
      confidence: 0.86
    };
  }
  const responseText = String(response ?? "");
  const rubricHits = question.rubric?.filter((item) => {
    const keyword = item.split(" ")[0] ?? item;
    return responseText.toLowerCase().includes(keyword.toLowerCase());
  }).length ?? 0;
  const lengthScore = Math.min(responseText.trim().split(/\s+/).filter(Boolean).length / 30, 1);
  const score = question.type === "short-answer" ? Math.max(lengthScore * 0.7, rubricHits / Math.max(question.rubric?.length ?? 1, 1)) : lengthScore;
  return {
    score: Number(score.toFixed(2)),
    reasoning: "Local fallback grader scored the answer from rubric keyword coverage and answer completeness. Configure OpenRouter for production semantic grading.",
    confidence: 0.62
  };
}

async function gradeWithOpenRouter(input: GradeInput): Promise<GradeResult> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Grade the hiring assessment answer. Return JSON: score 0..1, reasoning, confidence 0..1. Never return a bare score."
        },
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenRouter grading failed: ${res.status} ${await res.text()}`);
  const payload = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned no grading content");
  return gradeSchema.parse(JSON.parse(content));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("qorium grader-worker ready; import gradeAnswer() or configure BullMQ in production.");
}
