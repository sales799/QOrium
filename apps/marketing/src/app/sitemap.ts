import type { MetadataRoute } from 'next';
import { siteConfig } from '@/content/site.config';
import { listBlogPosts } from '@/lib/blog';
import {
  comparePages,
  guides,
  jobDescriptions,
  skillLibrary,
  slugify,
  solutionPages,
} from '@/content/phase4';
import { samplePacks } from '@/content/interactive-proof';
import { seoSitemapFamilies } from '@/content/seo-graph';

const STATIC_PATHS = [
  '/',
  '/platform',
  '/platform/readybank',
  '/platform/jd-forge',
  '/platform/stack-vault',
  '/product',
  '/product/assessment-library',
  '/product/api',
  '/features',
  '/features/readybank',
  '/features/jd-forge',
  '/features/stack-vault',
  '/solutions/assessment-platforms',
  '/solutions/enterprises-gcc',
  '/solutions/staffing-firms',
  '/solutions/platforms',
  '/solutions/enterprises',
  '/solutions/staffing',
  '/pricing',
  '/resources',
  '/resources/docs',
  '/resources/sample-packs',
  '/research',
  '/research/plagiarism-benchmark',
  '/resources/guides',
  '/resources/job-descriptions',
  '/try',
  '/try/jd-forge',
  '/try/graded-answer',
  '/llm-info',
  '/customers',
  '/customer/talpro-india',
  '/trust',
  '/security',
  '/compliance-dpdp',
  '/responsible-ai',
  '/science',
  '/method',
  '/anti-leak',
  '/authoring',
  '/about',
  '/contact',
  '/demo',
  '/signin',
  '/blog',
  '/changelog',
  '/press-kit',
  '/privacy',
  '/terms',
  '/dpa',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1.0 : path.startsWith('/blog') ? 0.7 : 0.8,
  }));

  const blogPosts = listBlogPosts();
  const blogEntries = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const skillEntries = skillLibrary.map((skill) => ({
    url: `${siteConfig.url}/skill/${slugify(skill.name)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const jdEntries = jobDescriptions.map((job) => ({
    url: `${siteConfig.url}/resources/job-descriptions/${slugify(job.title)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.72,
  }));

  const compareEntries = comparePages.map((page) => ({
    url: `${siteConfig.url}/compare/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const guideEntries = guides.map((guide) => ({
    url: `${siteConfig.url}/resources/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  const solutionEntries = solutionPages.map((page) => ({
    url: `${siteConfig.url}/solutions/${page.axis}/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const samplePackEntries = samplePacks.map((pack) => ({
    url: `${siteConfig.url}/resources/sample-packs/${pack.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.68,
  }));

  const seoGraphEntries = [
    ...seoSitemapFamilies.library,
    ...seoSitemapFamilies.roles,
    ...seoSitemapFamilies.stacks,
    ...seoSitemapFamilies.vs,
  ].map((entry) => ({
    url: entry.url,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: entry.url.includes('/library/') ? 0.7 : 0.66,
  }));

  return [
    ...staticEntries,
    ...blogEntries,
    ...skillEntries,
    ...jdEntries,
    ...compareEntries,
    ...guideEntries,
    ...solutionEntries,
    ...samplePackEntries,
    ...seoGraphEntries,
  ];
}
