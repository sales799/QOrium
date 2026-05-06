'use client';

import { useActionState } from 'react';
import { upsertSsoAction, type SsoActionState } from '../_actions';
import type { SsoConfigDto } from '@/lib/clients/sso';

const INITIAL: SsoActionState = { status: 'idle' };

interface SsoFormProps {
  config: SsoConfigDto | null;
}

export function SsoForm({ config }: SsoFormProps) {
  const [state, formAction, pending] = useActionState(upsertSsoAction, INITIAL);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Protocol"
          name="protocol"
          defaultValue={config?.protocol ?? 'saml'}
          as="select"
        >
          <option value="saml">SAML 2.0</option>
          <option value="oidc">OpenID Connect</option>
        </Field>
        <Field
          label="IdP type"
          name="idp_type"
          defaultValue={config?.idpType ?? 'custom'}
          as="select"
        >
          <option value="custom">Custom SAML / OIDC</option>
          <option value="okta">Okta</option>
          <option value="azure_ad">Azure AD</option>
          <option value="google_workspace">Google Workspace</option>
          <option value="ping">Ping Identity</option>
          <option value="jumpcloud">JumpCloud</option>
          <option value="onelogin">OneLogin</option>
        </Field>
        <Field label="Status" name="status" defaultValue={config?.status ?? 'draft'} as="select">
          <option value="draft">Draft</option>
          <option value="test_mode">Test mode</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </Field>
        <Field label="Metadata URL" name="metadata_url" defaultValue={config?.metadataUrl ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="IdP Entity ID" name="entity_id" defaultValue={config?.entityId ?? ''} />
        <Field
          label="SSO endpoint URL"
          name="sso_endpoint_url"
          defaultValue={config?.ssoEndpointUrl ?? ''}
        />
        <Field
          label="SLO endpoint URL"
          name="slo_endpoint_url"
          defaultValue={config?.sloEndpointUrl ?? ''}
        />
        <Field label="OIDC issuer" name="oidc_issuer" defaultValue={config?.oidcIssuer ?? ''} />
        <Field
          label="OIDC client id"
          name="oidc_client_id"
          defaultValue={config?.oidcClientId ?? ''}
        />
        <Field
          label="OIDC client secret"
          name="oidc_client_secret"
          type="password"
          defaultValue=""
          help="Set once; left blank to leave the existing value unchanged."
        />
      </div>
      <Field
        label="IdP signing certificate (PEM)"
        name="idp_certificate"
        defaultValue={config?.idpCertificate ?? ''}
        as="textarea"
      />
      <Field
        label="Attribute mapping (JSON)"
        name="attribute_mapping"
        defaultValue={JSON.stringify(config?.attributeMapping ?? {}, null, 2)}
        as="textarea"
        help='e.g. {"groupToRole":{"acme_admins":"admin"},"emailAttr":"email"}'
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {pending ? 'Saving…' : 'Save configuration'}
        </button>
        {state.status !== 'idle' && state.message && (
          <p
            role="status"
            className={
              state.status === 'success' ? 'text-xs text-emerald-700' : 'text-xs text-red-700'
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  help?: string;
  children?: React.ReactNode;
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  as = 'input',
  help,
  children,
}: FieldProps) {
  const cls =
    'block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900';
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
      {as === 'textarea' && (
        <textarea name={name} rows={4} defaultValue={defaultValue} className={`${cls} font-mono`} />
      )}
      {as === 'select' && (
        <select name={name} defaultValue={defaultValue} className={cls}>
          {children}
        </select>
      )}
      {as === 'input' && (
        <input type={type} name={name} defaultValue={defaultValue} className={cls} />
      )}
      {help && <span className="text-[11px] text-neutral-500">{help}</span>}
    </label>
  );
}
