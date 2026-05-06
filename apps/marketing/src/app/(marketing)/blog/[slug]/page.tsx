import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, User } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { MaxWidth } from '@/components/site/MaxWidth';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { mdxComponents } from '@/lib/mdx';
import { getBlogPost, listBlogPosts } from '@/lib/blog';
import { siteConfig } from '@/content/site.config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return listBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="bg-background">
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        url={`${siteConfig.url}/blog/${post.slug}`}
        datePublished={post.date}
        author={post.author}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <MaxWidth as="div" className="py-16">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to blog
        </Link>

        <header className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold text-foreground text-balance">{post.title}</h1>
          <p className="text-pretty text-lg text-muted-foreground">{post.description}</p>
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3" /> {fmtDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="size-3" /> {post.author}
            </span>
            {post.tags?.length
              ? post.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-pill border border-border px-2 py-0.5 text-[11px]"
                  >
                    {t}
                  </span>
                ))
              : null}
          </div>
        </header>

        <div className="prose mx-auto mt-12 max-w-3xl">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>
      </MaxWidth>
    </article>
  );
}
