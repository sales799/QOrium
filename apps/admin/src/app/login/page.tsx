import { signIn } from '@/auth';

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<{ from?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const from = params.from && params.from.startsWith('/') ? params.from : '/admin/queue';
  const error = params.error;

  async function handleLogin(formData: FormData) {
    'use server';
    const email = String(formData.get('email') ?? '');
    await signIn('credentials', {
      email,
      redirectTo: from,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">QOrium Admin</h1>
          <p className="text-sm text-neutral-500">
            Internal-only console for SME review &amp; IRT calibration. Sign in with an allowlisted
            email; OTP delivery is stubbed in this build.
          </p>
        </header>
        {error && (
          <div
            role="alert"
            className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            Sign-in failed. Verify the email is on the allowlist and try again.
          </div>
        )}
        <form action={handleLogin} className="space-y-4" aria-label="Admin sign-in">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="you@talpro.in"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            Continue
          </button>
        </form>
        <p className="text-xs text-neutral-400">
          Real MSG91 OTP &amp; (optional) Google OAuth providers activate once credentials are
          provisioned. See <code>infra/CTO-deltas/</code>.
        </p>
      </div>
    </main>
  );
}
