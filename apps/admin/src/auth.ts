import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { buildAdminUser, isEmailAllowed, parseEmailAllowlist } from '@/auth-config';
import { loadAdminEnv } from '@/env';

const env = loadAdminEnv();
const allowlist = parseEmailAllowlist(env.emailAllowlistRaw);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.authSecret,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Email allowlist (dev/scaffold)',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      authorize: async (raw) => {
        const email = typeof raw?.email === 'string' ? raw.email : null;
        if (!email) return null;
        if (!isEmailAllowed(email, allowlist)) return null;
        return buildAdminUser(email);
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth: session, request }) => {
      const pathname = request.nextUrl.pathname;
      // Public surfaces: login page + auth API
      if (pathname === '/login' || pathname.startsWith('/api/auth')) return true;
      // Health endpoint always public
      if (pathname === '/healthz') return true;
      // Everything else (including `/`, `/admin/*`) requires a session
      return !!session?.user;
    },
  },
});
