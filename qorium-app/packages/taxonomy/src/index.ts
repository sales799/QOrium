import librarySeed from "../library-seed.json" with { type: "json" };
import taxonomySeed from "../seed.json" with { type: "json" };

export type SkillNodeKind = "category" | "skill" | "sub_skill";

export interface SkillNode {
  id: string;
  parentId: string | null;
  kind: SkillNodeKind;
  name: string;
  slug: string;
  tags: string[];
}

export type QuestionType = "mcq" | "multi-select" | "short-answer" | "code-question";

export interface LibraryQuestion {
  id: string;
  skillId: string;
  type: QuestionType;
  difficulty: number;
  stem: string;
  explanation: string;
  irt: { a: number; b: number; c: number };
  tags: string[];
  options?: string[];
  correctAnswer: unknown;
  rubric?: string[];
  languageHints?: string[];
  starterCode?: Record<string, string>;
  testExpectation?: string;
}

export const skillNodes = taxonomySeed.nodes as SkillNode[];
export const libraryQuestions = librarySeed.questions as LibraryQuestion[];

export function getSkillStats() {
  const byKind = skillNodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.kind] = (acc[node.kind] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: skillNodes.length,
    categories: byKind.category ?? 0,
    skills: byKind.skill ?? 0,
    subSkills: byKind.sub_skill ?? 0
  };
}

/** Select populated skills before applying the display cap; seed order stays familiar. */
export function selectLibraryCards(nodes: SkillNode[], counts: ReadonlyMap<string, number>) {
  const seedOrder = new Map(skillNodes.map((skill, index) => [skill.id, index]));
  return nodes
    .filter((node) => node.kind === "skill" && (counts.get(node.id) ?? 0) > 0)
    .sort((left, right) => {
      const rank = (seedOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (seedOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER);
      return rank || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
    })
    .slice(0, 25)
    .map((skill) => ({ skill, questionCount: counts.get(skill.id)! }));
}

export function getLibraryCards() {
  const counts = new Map<string, number>();
  for (const question of libraryQuestions) counts.set(question.skillId, (counts.get(question.skillId) ?? 0) + 1);
  return selectLibraryCards(skillNodes, counts);
}
