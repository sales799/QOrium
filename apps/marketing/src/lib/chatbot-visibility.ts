const HIDDEN_PREFIXES = ['/admin', '/app', '/candidate', '/auth'];
const HIDDEN_EXACT = new Set(['/responsible-ai', '/llm-info']);

export function shouldShowChatbot(pathname: string): boolean {
  const path = pathname.split('?')[0] ?? '/';
  if (HIDDEN_EXACT.has(path)) return false;
  return !HIDDEN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
