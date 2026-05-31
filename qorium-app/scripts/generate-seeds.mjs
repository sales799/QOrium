import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const categories = [
  ["engineering", "Engineering", ["Java", "React", "Python", "SQL", "DevOps", "AWS", "AI Engineering", "Data Engineering", "Security", "System Design"]],
  ["india-stack", "India Enterprise Stack", ["SAP ABAP", "Oracle HCM Cloud", "Salesforce CPQ", "Finacle", "Flexcube", "Embedded Automotive", "Apex", "ServiceNow", "Guidewire", "Temenos"]],
  ["product", "Product & Design", ["Product Strategy", "UX Research", "Analytics", "Experimentation", "Design Systems", "Technical Writing", "API Product", "Growth", "Pricing", "Roadmapping"]],
  ["business", "Business Operations", ["Sales", "Customer Success", "Recruiting", "Finance", "Legal Ops", "Procurement", "Program Management", "Operations", "Support", "People Ops"]],
  ["ai-era", "AI Era Skills", ["Prompt Engineering", "AI Code Review", "Agent Workflow Design", "RAG Evaluation", "Model Risk", "AI Safety", "Tool Use Judgement", "AI Pair Coding", "Data Labeling", "Eval Design"]]
];

const subSkillMap = [
  "fundamentals",
  "advanced-patterns",
  "debugging",
  "security",
  "performance",
  "production-operations",
  "architecture",
  "testing",
  "observability",
  "integration"
];

const nodes = [];
for (const [categoryId, categoryName, skills] of categories) {
  nodes.push({
    id: categoryId,
    parentId: null,
    kind: "category",
    name: categoryName,
    slug: categoryId,
    tags: ["category"]
  });
  for (const skill of skills) {
    const skillSlug = skill.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const skillId = `${categoryId}.${skillSlug}`;
    nodes.push({
      id: skillId,
      parentId: categoryId,
      kind: "skill",
      name: skill,
      slug: skillSlug,
      tags: [categoryId, "phase-1"]
    });
    for (const sub of subSkillMap.slice(0, 2)) {
      nodes.push({
        id: `${skillId}.${sub}`,
        parentId: skillId,
        kind: "sub_skill",
        name: `${skill} ${title(sub)}`,
        slug: `${skillSlug}-${sub}`,
        tags: [categoryId, skillSlug, sub]
      });
    }
  }
}

const phaseOneSkillIds = nodes.filter((node) => node.kind === "skill").slice(0, 25).map((node) => node.id);
const library = [];

for (const skillId of phaseOneSkillIds) {
  const skill = nodes.find((node) => node.id === skillId);
  for (let index = 1; index <= 10; index += 1) {
    const type = index % 5 === 0 ? "code-question" : index % 4 === 0 ? "short-answer" : index % 3 === 0 ? "multi-select" : "mcq";
    library.push(makeQuestion(skill, index, type));
  }
}

writeJson("packages/taxonomy/seed.json", { version: "2026-05-31.phase1", nodes });
writeJson("packages/taxonomy/library-seed.json", { version: "2026-05-31.phase1", questions: library });

console.log(`Generated ${nodes.length} taxonomy nodes and ${library.length} library questions.`);

function makeQuestion(skill, index, type) {
  const id = `q_${skill.slug}_${String(index).padStart(2, "0")}`;
  const prompt = `${skill.name}: choose the best production-grade response for scenario ${index}.`;
  const base = {
    id,
    skillId: skill.id,
    type,
    difficulty: ((index - 1) % 5) + 1,
    stem: prompt,
    explanation: `Assesses ${skill.name} with a Phase 1 placeholder IRT model.`,
    irt: { a: 1, b: 0, c: 0.25 },
    tags: ["phase-1", skill.slug]
  };
  if (type === "code-question") {
    return {
      ...base,
      languageHints: ["javascript", "python", "java"],
      stem: `${skill.name}: implement fizzBuzz(n) and return the sequence from 1..n as comma-separated text.`,
      starterCode: {
        javascript: "function fizzBuzz(n) {\n  // return comma-separated output\n}\nconsole.log(fizzBuzz(15));",
        python: "def fizz_buzz(n):\n    # return comma-separated output\n    pass\n\nprint(fizz_buzz(15))",
        java: "class Main { public static void main(String[] args) { System.out.println(\"TODO\"); } }"
      },
      testExpectation: "1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz",
      correctAnswer: "Reference solution returns Fizz for multiples of 3, Buzz for 5, and FizzBuzz for 15."
    };
  }
  if (type === "short-answer") {
    return {
      ...base,
      rubric: ["Names the trade-off", "Mentions failure mode", "Gives an implementation step"],
      correctAnswer: "A complete answer names the trade-off, failure mode, and implementation step."
    };
  }
  const options = [
    "Design for correctness first, then measure and optimize with observable evidence.",
    "Skip validation to move faster in production.",
    "Hide failures from logs so users are not alarmed.",
    "Use a single global credential for every customer."
  ];
  return {
    ...base,
    options,
    correctAnswer: type === "multi-select" ? [0] : 0
  };
}

function title(value) {
  return value.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

function writeJson(relativePath, value) {
  const target = join(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}
