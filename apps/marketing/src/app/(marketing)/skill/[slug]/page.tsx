import { permanentRedirect } from 'next/navigation';

import { getLibrarySkill } from '@/content/seo-graph';

type Props = { params: Promise<{ slug: string }> };

export default async function LegacySkillRedirect({ params }: Props) {
  const { slug } = await params;
  const skill = getLibrarySkill(slug);
  permanentRedirect(skill?.path ?? `/library/${slug}`);
}
