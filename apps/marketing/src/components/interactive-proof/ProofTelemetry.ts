'use client';

type PlausibleWindow = Window & {
  plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
};

export type ProofEvent =
  | 'jd_forge_demo_paste'
  | 'jd_forge_demo_sample_loaded'
  | 'jd_forge_demo_extracted'
  | 'jd_forge_demo_skill_clicked'
  | 'jd_forge_demo_plan_pdf_requested'
  | 'jd_forge_demo_demo_cta_click'
  | 'graded_answer_viewer_open'
  | 'graded_answer_exemplar_selected'
  | 'graded_answer_reasoning_expanded'
  | 'graded_answer_audit_meta_copied'
  | 'graded_answer_fairness_vote'
  | 'graded_answer_demo_cta_click'
  | 'sample_pack_hub_view'
  | 'sample_pack_filtered'
  | 'sample_pack_card_click'
  | 'sample_pack_preview_view'
  | 'sample_pack_unlock_submitted'
  | 'sample_pack_pdf_email_sent'
  | 'sample_pack_full_view'
  | 'proof_cta_clicked';

export function trackProofEvent(event: ProofEvent, props: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  (window as PlausibleWindow).plausible?.(event, { props });
}
