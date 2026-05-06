import Link from 'next/link';
import type { ReactNode } from 'react';
import { auth, signOut } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? null;

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-6">
          <Link href="/admin/queue" className="text-base font-semibold tracking-tight">
            QOrium Admin
          </Link>
          <nav aria-label="Admin sections" className="flex items-center gap-4 text-sm">
            <Link
              href="/admin/queue"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              SME queue
            </Link>
            <Link
              href="/admin/calibration"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              IRT calibration
            </Link>
            <Link
              href="/admin/sso"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              SSO
            </Link>
            <Link
              href="/admin/webhooks"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              Webhooks
            </Link>
            <Link
              href="/admin/audit"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              Audit log
            </Link>
            <Link
              href="/admin/ats"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              ATS
            </Link>
            <Link
              href="/admin/customers"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              Customers
            </Link>
            <Link
              href="/admin/uptime"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              Uptime
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {email && <span className="text-neutral-500">{email}</span>}
          <form action={handleSignOut}>
            <button
              type="submit"
              className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
