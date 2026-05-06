import { notFound } from 'next/navigation';
import { findSection, SECTIONS } from '@/lib/sections';
import { renderSection } from '@/lib/content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const section = findSection(params.slug);
  if (!section) return { title: 'Not Found' };
  return { title: `${section.title} · QOrium API docs` };
}

export default async function SectionPage(props: PageProps) {
  const params = await props.params;
  const section = findSection(params.slug);
  if (!section) notFound();
  const html = renderSection(section);

  return (
    <article>
      <p style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', letterSpacing: 0.5 }}>
        {section.category.replace('-', ' ')}
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 8 }}>{section.title}</h1>
      <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{section.summary}</p>
      <div
        style={{ marginTop: 24, fontSize: 14, lineHeight: 1.7, color: '#1a1a1a' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
