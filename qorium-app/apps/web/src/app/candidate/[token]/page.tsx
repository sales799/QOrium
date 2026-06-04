import { CandidateAssessment } from "./ui";
import { api } from "../../../lib/api";

interface Assessment {
  id: string;
  title: string;
  candidateEmail: string;
  questions: Array<{
    id: string;
    type: "mcq" | "multi-select" | "short-answer" | "code-question" | "simulation" | "video-response";
    stem: string;
    options?: string[];
    starterCode?: Record<string, string>;
    simulation?: {
      scenario: string;
      roleContext: string;
      steps: Array<{ id: string; prompt: string; inputType: "written" | "code" | "video" }>;
    };
    videoPrompt?: {
      prompt: string;
      maxSeconds: number;
      transcriptionProvider: "whisper" | "deepgram";
    };
  }>;
}

export default async function CandidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = await api<{ assessment: Assessment }>(`/api/v1/assessments/by-token?token=${encodeURIComponent(token)}`);
  return <CandidateAssessment token={token} assessment={payload.assessment} />;
}
