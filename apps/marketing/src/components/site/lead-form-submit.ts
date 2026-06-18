export type LeadFormIntent = 'demo' | 'contact';

export type LeadFormState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export const initialLeadFormState: LeadFormState = { ok: false, message: '' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isLeadFormState(value: unknown): value is LeadFormState {
  return isRecord(value) && typeof value.ok === 'boolean' && typeof value.message === 'string';
}

export async function submitLeadCaptureForm(
  intent: LeadFormIntent,
  form: HTMLFormElement,
): Promise<LeadFormState> {
  const formData = new FormData(form);
  formData.set('intent', intent);

  const response = await fetch('/api/lead-capture', {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data: unknown = await response.json();
    if (isLeadFormState(data)) {
      return data;
    }
  }

  return {
    ok: false,
    message: response.ok
      ? 'Your request was received, but the response could not be read.'
      : 'Could not send the form right now. Please email us directly.',
  };
}
