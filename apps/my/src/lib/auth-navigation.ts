export function safeNextPath(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export function nextPathFromSearch(search: string, fallback = '/dashboard'): string {
  return safeNextPath(new URLSearchParams(search).get('next'), fallback);
}

export function loginUrl(nextPath: string): string {
  return `/login?next=${encodeURIComponent(safeNextPath(nextPath))}`;
}
