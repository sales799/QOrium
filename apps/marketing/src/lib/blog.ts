import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  tags?: string[];
  hero?: string;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export function listBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  const posts: BlogPostMeta[] = files.map((f) => {
    const slug = f.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
    const { data } = matter(raw);
    return { ...(data as BlogFrontmatter), slug };
  });
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getBlogPost(slug: string): BlogPost | null {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  return { ...(data as BlogFrontmatter), slug, content };
}
