import { redirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function TopLevelJobDescriptionPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/resources/job-descriptions/${slug}`);
}
