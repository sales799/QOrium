import { listSamplePacks } from '@/content/interactive-proof';
import { ok } from '../_proof-response';

export async function GET(_request?: Request) {
  return ok(
    { packs: listSamplePacks() },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    },
  );
}
