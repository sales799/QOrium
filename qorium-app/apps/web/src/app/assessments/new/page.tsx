import { AssessmentBuilder } from "./ui";
import { api } from "../../../lib/api";

interface Card {
  skill: { id: string; name: string; tags: string[] };
  questionCount: number;
}

export default async function NewAssessmentPage() {
  const [cards, stats] = await Promise.all([
    api<Card[]>("/api/v1/library/cards"),
    api<{ total: number; skills: number; subSkills: number }>("/api/v1/skills?stats=true")
  ]);

  return <AssessmentBuilder cards={cards} stats={stats} />;
}
