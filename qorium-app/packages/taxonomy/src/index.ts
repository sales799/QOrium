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

export type QuestionType = "mcq" | "multi-select" | "short-answer" | "code-question" | "simulation" | "video-response";

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
  simulation?: {
    scenario: string;
    roleContext: string;
    steps: Array<{ id: string; prompt: string; inputType: "written" | "code" | "video"; rubric: string[] }>;
  };
  videoPrompt?: {
    prompt: string;
    maxSeconds: number;
    transcriptionProvider: "whisper" | "deepgram";
  };
}

const phaseFSkillNodes: SkillNode[] = [
  { id: "cognitive", parentId: null, kind: "category", name: "Cognitive Ability", slug: "cognitive", tags: ["phase-f", "scale-wedge"] },
  { id: "cognitive.numerical", parentId: "cognitive", kind: "skill", name: "Numerical Reasoning", slug: "numerical-reasoning", tags: ["phase-f", "cognitive"] },
  { id: "cognitive.logical", parentId: "cognitive", kind: "skill", name: "Logical Reasoning", slug: "logical-reasoning", tags: ["phase-f", "cognitive"] },
  { id: "cognitive.abstract", parentId: "cognitive", kind: "skill", name: "Abstract Reasoning", slug: "abstract-reasoning", tags: ["phase-f", "cognitive"] },
  { id: "cognitive.sjt", parentId: "cognitive", kind: "skill", name: "Situational Judgement", slug: "situational-judgement", tags: ["phase-f", "cognitive"] },
  { id: "simulation", parentId: null, kind: "category", name: "Job Simulations", slug: "job-simulations", tags: ["phase-f", "scale-wedge"] },
  { id: "simulation.sql-support", parentId: "simulation", kind: "skill", name: "SQL Support Simulation", slug: "sql-support-simulation", tags: ["phase-f", "job-simulation"] },
  { id: "communication", parentId: null, kind: "category", name: "Communication", slug: "communication", tags: ["phase-f", "scale-wedge"] },
  { id: "communication.incident-explanation", parentId: "communication", kind: "skill", name: "Incident Explanation", slug: "incident-explanation", tags: ["phase-f", "video-response"] }
];

const cognitiveOptions = [
  "Use the observable evidence and compute the exact answer before choosing.",
  "Pick the fastest-looking answer and skip the working.",
  "Assume the trend continues without checking the numbers.",
  "Reject the question because cognitive checks are never useful."
];

const phaseFLibraryQuestions: LibraryQuestion[] = [
  ...["numerical", "logical", "abstract", "sjt"].map((skill, index) => ({
    id: `phase_f_cognitive_${skill}_01`,
    skillId: `cognitive.${skill}`,
    type: "mcq" as const,
    difficulty: index + 1,
    stem: `${phaseFSkillNodes.find((node) => node.id === `cognitive.${skill}`)?.name}: choose the most defensible answer for an adaptive screening item.`,
    explanation: "Phase F cognitive seed item with honest model-estimated IRT parameters.",
    irt: { a: 1, b: index - 1, c: 0.25 },
    tags: ["phase-f", "cognitive", skill],
    options: cognitiveOptions,
    correctAnswer: 0
  })),
  ...[2, 3, 4].map((item) => ({
    id: `phase_f_cognitive_numerical_0${item}`,
    skillId: "cognitive.numerical",
    type: "mcq" as const,
    difficulty: item,
    stem: `Numerical Reasoning: inspect the evidence table and choose the safest calculation path for item ${item}.`,
    explanation: "Phase F numerical reasoning seed item with honest model-estimated IRT parameters.",
    irt: { a: 1, b: item - 2, c: 0.25 },
    tags: ["phase-f", "cognitive", "numerical"],
    options: cognitiveOptions,
    correctAnswer: 0
  })),
  {
    id: "phase_f_sim_sql_support_01",
    skillId: "simulation.sql-support",
    type: "simulation",
    difficulty: 4,
    stem: "Triage a slow customer report query, explain the likely cause, and propose the safest production fix.",
    explanation: "Three-step job simulation graded by rubric coverage and reasoning trace.",
    irt: { a: 1.1, b: 0.6, c: 0.1 },
    tags: ["phase-f", "job-simulation", "sql"],
    correctAnswer: "Strong answers inspect query shape, identify missing index/selectivity risk, and propose measured rollout.",
    simulation: {
      scenario: "A staffing operations dashboard times out when a recruiter opens a candidate shortlist.",
      roleContext: "Senior SQL support engineer",
      steps: [
        { id: "triage", prompt: "List the first three signals you would inspect.", inputType: "written", rubric: ["query plan", "slow endpoint", "recent data growth"] },
        { id: "diagnose", prompt: "Explain the most likely root cause from the evidence.", inputType: "written", rubric: ["index", "selectivity", "join/filter"] },
        { id: "fix", prompt: "Write the rollout-safe fix plan.", inputType: "written", rubric: ["migration", "measurement", "rollback"] }
      ]
    }
  },
  {
    id: "phase_f_video_incident_01",
    skillId: "communication.incident-explanation",
    type: "video-response",
    difficulty: 3,
    stem: "Record a two-minute explanation of a production incident you debugged, including evidence, trade-off, and prevention.",
    explanation: "Video response seed item. Runtime stores media in India-resident object storage and grades transcript through M4.",
    irt: { a: 0.9, b: 0, c: 0.1 },
    tags: ["phase-f", "video-response"],
    correctAnswer: "Strong responses name evidence, root cause, trade-off, remediation, and future prevention.",
    rubric: ["evidence", "root cause", "prevention"],
    videoPrompt: {
      prompt: "Explain a production incident you debugged.",
      maxSeconds: 120,
      transcriptionProvider: "whisper"
    }
  }
];

export const skillNodes = [...taxonomySeed.nodes as SkillNode[], ...phaseFSkillNodes];
export const libraryQuestions = [...librarySeed.questions as LibraryQuestion[], ...phaseFLibraryQuestions];

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
