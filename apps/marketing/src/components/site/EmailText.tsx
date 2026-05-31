import { cn } from '@/lib/cn';

export function EmailText({ address, className }: { address: string; className?: string }) {
  const [local, domain] = address.split('@');
  if (!local || !domain) return <span className={className}>{address}</span>;

  return (
    <span className={cn('whitespace-nowrap', className)} aria-label={`${local} at ${domain}`}>
      <span>{local}</span>
      <span aria-hidden="true">@</span>
      <span>{domain}</span>
    </span>
  );
}
