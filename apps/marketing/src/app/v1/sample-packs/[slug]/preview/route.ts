import { getSamplePackPreview } from '@/content/interactive-proof';
import { ok, problem } from '../../../_proof-response';

type PreviewContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: PreviewContext) {
  const { slug } = await context.params;
  const pack = getSamplePackPreview(slug);
  if (!pack) {
    return problem(404, 'Not Found', `No public sample pack exists for ${slug}.`);
  }

  return ok(
    {
      slug: pack.slug,
      title: pack.title,
      previewItems: pack.previewItems,
      lockedItemCount: pack.itemCount - pack.previewItems.length,
      calibrationBadge: pack.calibrationBadge,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    },
  );
}
