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

export function getLibraryCards() {
  return skillNodes
    .filter((node) => node.kind === "skill")
    .slice(0, 25)
    .map((skill) => ({
      skill,
      questionCount: libraryQuestions.filter((question) => question.skillId === skill.id).length
    }));
}
