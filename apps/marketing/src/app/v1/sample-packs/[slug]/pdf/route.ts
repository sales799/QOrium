import { getSamplePack } from '@/content/interactive-proof';
import { createSimplePdf } from '@/lib/simple-pdf';
import { problem } from '../../../_proof-response';

type PdfContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: PdfContext) {
  const { slug } = await context.params;
  const token = new URL(request.url).searchParams.get('token');
  const pack = getSamplePack(slug);
  if (!pack) {
    return problem(404, 'Not Found', `No public sample pack exists for ${slug}.`);
  }
  if (!token?.startsWith('qsp_')) {
    return problem(
      403,
      'Forbidden',
      'Sample-pack PDFs are delivered by email and require a signed token.',
    );
  }

  const body = createSimplePdf(pack.title, [
    pack.summary,
    '',
    ...[...pack.previewItems, ...pack.gatedItems].map(
      (item) => `- ${item.id}: ${item.title} (${item.format}, ${item.difficulty})`,
    ),
  ]);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pack.slug}-sample-pack.pdf"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
