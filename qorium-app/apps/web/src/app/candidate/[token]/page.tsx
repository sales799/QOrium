import { CandidateAssessment } from "./ui";
import { api } from "../../../lib/api";

interface Assessment {
  id: string;
  title: string;
  candidateEmail: string;
  questions: Array<{
    id: string;
    type: "mcq" | "multi-select" | "short-answer" | "code-question";
    stem: string;
    options?: string[];
    starterCode?: Record<string, string>;
  }>;
}

export default async function CandidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = await api<{ assessment: Assessment }>(`/api/v1/assessments/by-token?token=${encodeURIComponent(token)}`);
  return <CandidateAssessment token={token} assessment={payload.assessment} />;
}
