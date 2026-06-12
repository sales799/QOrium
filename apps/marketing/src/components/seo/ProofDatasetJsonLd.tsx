import { safeJsonLdString } from '@/lib/proof-jsonld-guard';

const DEFAULT_PROOF_API_BASE = 'https://api.qorium.online';
const FETCH_TIMEOUT_MS = 2500;

/**
 * Async server component that fetches a live, aggregate, anonymous proof
 * Dataset JSON-LD document from the QOrium API and renders it into the page
 * <head> as an application/ld+json script tag, so AI answer engines and
 * crawlers can discover and cite QOrium's real psychometric-coverage funnel
 * without scraping HTML.
 *
 * Resilience contract: this never breaks the page. On any failure — timeout,
 * non-200, unparseable body, or a payload that is not a valid schema.org
 * Dataset — it renders null. The response is cached at the edge for 5 minutes
 * (revalidate: 300) so the trust page does not pay a per-request round trip.
 */
export async function ProofDatasetJsonLd({
  path,
}: {
  /** Proof JSON-LD path, e.g. '/v1/proof/psychometrics.jsonld'. */
  path: string;
}) {
  const base = process.env.QORIUM_API_BASE_URL?.trim() || DEFAULT_PROOF_API_BASE;
  const url = `${base.replace(/\/$/, '')}${path}`;

  const json = await fetchProofJsonLd(url);
  const serialised = safeJsonLdString(json);
  if (serialised === null) return null;

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialised }} />;
}

async function fetchProofJsonLd(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/ld+json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
