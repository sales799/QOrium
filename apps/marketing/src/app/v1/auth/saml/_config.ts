import type { TenantSsoConfig } from '@qorium/saml';

export interface SamlProofTenant {
  slug: string;
  config: TenantSsoConfig;
  spEntityId: string;
  spAcsUrl: string;
  spSloUrl?: string;
}

export const samlTestAppId = 'app_01kt37ryqb2afz92fjxj0wgjaw';

const spBaseUrl = 'https://api.qorium.online';
const samlTestBaseUrl = `https://www.samltest.dev/apps/${samlTestAppId}`;
const samlTestSigningCert = [
  'MIIDBzCCAe+gAwIBAgIUCLBK4f75EXEe4gyroYnVaqLoSp4wDQYJKoZIhvcNAQEL',
  'BQAwEzERMA8GA1UEAwwIZHVtbXlpZHAwHhcNMjQwNTEzMjE1NDE2WhcNMzQwNTEx',
  'MjE1NDE2WjATMREwDwYDVQQDDAhkdW1teWlkcDCCASIwDQYJKoZIhvcNAQEBBQAD',
  'ggEPADCCAQoCggEBAKhmgQmWb8NvGhz952XY4SlJlpWIK72RilhOZS9frDYhqWVJ',
  'HsGH9Z7sSzrM/0+YvCyEWuZV9gpMeIaHZxEPDqW3RJ7KG51fn/s/qFvwctf+CZDj',
  'yfGDzYs+XIgf7p56U48EmYeWpB/aUW64gSbnPqrtWmVFBisOfIx5aY3NubtTsn+g',
  '0XbdX0L57+NgSvPQHXh/GPXA7xCIWm54G5kqjozxbKEFA0DS3yb6oHRQWHqIAM/7',
  'mJMdUVZNIV1q7c2JIgAl23uDWq+2KTE2R5liP/KjvjwKonVKtTqGqX6ei25rsTHO',
  'aDpBH/LdQK2txgsm7R7+IThWNvUI0TttrmwBqyMCAwEAAaNTMFEwHQYDVR0OBBYE',
  'FD142gxIAJMhpgMkgpzmRNoW9XbEMB8GA1UdIwQYMBaAFD142gxIAJMhpgMkgpzm',
  'RNoW9XbEMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBADQd6k6z',
  'FIc20GfGHY5C2MFwyGOmP5/UG/JiTq7Zky28G6D0NA0je+GztzXx7VYDfCfHxLcm',
  '2k5t9nYhb9kVawiLUUDVF6s+yZUXA4gUA3KoTWh1/oRxR3ggW7dKYm9fsNOdQAbx',
  'UUkzp7HLZ45ZlpKUS0hO7es+fPyF5KVw0g0SrtQWwWucnQMAQE9m+B0aOf+92y7J',
  'QkdgdR8Gd/XZ4NZfoOnKV7A1utT4rWxYCgICeRTHx9tly5OhPW4hQr5qOpngcsJ9',
  'vhr86IjznQXhfj3hql5lA3VbHW04ro37ROIkh2bShDq5dwJJHpYCGrF3MQv8S3m+',
  'jzGhYL6m9gFTm/8=',
].join('');

const samlProofTenants: Record<string, SamlProofTenant> = {
  acme: {
    slug: 'acme',
    config: {
      tenantId: '00000000-0000-0000-0000-000000000001',
      protocol: 'saml',
      idpEntityId: samlTestBaseUrl,
      idpSsoUrl: `${samlTestBaseUrl}/login`,
      idpSigningCert: samlTestSigningCert,
      idpMetadataUrl: `${samlTestBaseUrl}/metadata`,
      defaultRedirectPath: '/recruiter/dashboard.html',
      allowJitProvisioning: true,
      allowIdpInitiated: false,
      deleteUsersAllowed: false,
      encryptionRequired: false,
    },
    spEntityId: `${spBaseUrl}/saml/acme`,
    spAcsUrl: `${spBaseUrl}/v1/auth/saml/acs`,
  },
};

export function getSamlProofTenant(slug: string | null): SamlProofTenant | null {
  if (!slug || !/^[a-z0-9-]{2,40}$/.test(slug)) return null;
  return samlProofTenants[slug.toLowerCase()] ?? null;
}

export function getSamlProofTenants(): SamlProofTenant[] {
  return Object.values(samlProofTenants);
}

export function resolveRelayPath(
  value: string | null,
  fallbackPath: string,
): { ok: true; path: string } | { ok: false; message: string } {
  if (!value) return { ok: true, path: fallbackPath };
  if (value.length > 160)
    return { ok: false, message: 'return_to must be 160 characters or fewer.' };
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return { ok: false, message: 'return_to must be an internal path.' };
  }
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return { ok: false, message: 'return_to contains invalid control characters.' };
  }
  return { ok: true, path: value };
}

export function getPublicSigningCerts(): string[] {
  return (process.env.QORIUM_SAML_SP_PUBLIC_CERTS ?? '')
    .split(/\n\s*\n|,/)
    .map((cert) => cert.trim())
    .filter(Boolean);
}
