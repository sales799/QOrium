import { Router, raw, type Request, type Response, type NextFunction } from 'express';
import type { Pool } from '@qorium/db';
import type { Config } from '../config.js';
import { HttpProblem } from '../middleware/problem.js';
import { recruiterAuth, type RecruiterRequest } from '../middleware/recruiter-auth.js';
import { PLANS, isPlanId, planUnitAmountCents } from '../billing/plans.js';
import { razorpayConfigured, verifyWebhookSignature } from '../lib/razorpay.js';
import { getPaymentProvider, activeProviderName, getProvider } from '../lib/payment-provider.js';
import { verifyCfWebhookSignature } from '../lib/cashfree.js';
import {
  ensureCustomer,
  getSubscriptionForTenant,
  getUsageForTenant,
  findTenantByRazorpaySubscription,
  getCustomerIdByTenant,
  upsertSubscription,
} from '../repositories/billing.js';

export interface BillingRouterDeps {
  pool: Pool;
  config: Config;
}

// ── Recruiter-authed billing (mount at '/v1', same pattern as recruiterPortalRouter) ──
export function billingRecruiterRouter(deps: BillingRouterDeps): Router {
  const router = Router();
  router.use(
    '/recruiter',
    recruiterAuth({
      jwtSecret: deps.config.jwtSecret as string,
      cookieSecure: deps.config.cookieSecure,
    }),
  );
  const rec = (req: Request) => (req as RecruiterRequest).recruiter!;

  router.get(
    '/recruiter/billing/status',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { tenantId } = rec(req);
        const [sub, usage] = await Promise.all([
          getSubscriptionForTenant(deps.pool, tenantId),
          getUsageForTenant(deps.pool, tenantId),
        ]);
        const planId = sub?.tier && isPlanId(sub.tier) ? sub.tier : 'free';
        const provider = getPaymentProvider();
        res.status(200).json({
          plan: planId,
          status: sub?.status ?? 'active',
          currentPeriodEnd: sub?.current_period_end ?? null,
          usage,
          limits: PLANS[planId].limits,
          catalog: Object.values(PLANS).map((p) => ({
            id: p.id,
            name: p.name,
            priceInr: p.priceInr,
            custom: Boolean(p.custom),
            limits: p.limits,
          })),
          paymentProvider: provider.name,
          providerConfigured: provider.configured(),
          // retained for backward compatibility with the existing /billing page
          razorpayConfigured: razorpayConfigured(),
        });
      } catch (e) {
        next(e);
      }
    },
  );

  router.post(
    '/recruiter/billing/subscribe',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { tenantId, email, name } = rec(req);
        const planId = (req.body as { plan?: unknown }).plan;
        if (!isPlanId(planId)) throw new HttpProblem({ status: 422, title: 'Unknown plan' });
        const plan = PLANS[planId];
        const customerId = await ensureCustomer(deps.pool, { tenantId, email, name });

        if (plan.id === 'free') {
          await upsertSubscription(deps.pool, {
            customerId,
            tier: 'free',
            status: 'active',
            unitAmountCents: 0,
          });
          res.status(200).json({ plan: 'free', status: 'active', checkoutUrl: null });
          return;
        }
        if (plan.custom)
          throw new HttpProblem({ status: 422, title: 'Enterprise is custom — contact sales' });

        const provider = getPaymentProvider();
        if (!provider.configured())
          throw new HttpProblem({
            status: 503,
            title: 'Billing not configured',
            detail: `${provider.name} keys are not set on the server yet`,
          });
        const planEnv = provider.planEnvFor(plan);
        const providerPlanId = planEnv ? process.env[planEnv] : undefined;
        if (!providerPlanId)
          throw new HttpProblem({
            status: 503,
            title: 'Plan not provisioned',
            detail: `${planEnv ?? `${provider.name} plan env`} is not set`,
          });

        const subscription = await provider.createSubscription({
          providerPlanId,
          customerEmail: email,
          customerName: name,
          notes: { tenant_id: tenantId, qorium_plan: plan.id },
        });
        await upsertSubscription(deps.pool, {
          customerId,
          tier: plan.id,
          status: 'trial',
          unitAmountCents: planUnitAmountCents(plan.id),
          razorpaySubscriptionId: subscription.id,
        });
        res.status(200).json({
          plan: plan.id,
          status: subscription.status,
          checkoutUrl: subscription.checkoutUrl,
          provider: provider.name,
        });
      } catch (e) {
        next(e);
      }
    },
  );

  router.post(
    '/recruiter/billing/cancel',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { tenantId } = rec(req);
        const sub = await getSubscriptionForTenant(deps.pool, tenantId);
        if (!sub?.razorpay_subscription_id)
          throw new HttpProblem({ status: 404, title: 'No active subscription' });
        await getPaymentProvider().cancelSubscription(sub.razorpay_subscription_id);
        const customerId = await getCustomerIdByTenant(deps.pool, tenantId);
        if (customerId)
          await upsertSubscription(deps.pool, {
            customerId,
            tier: sub.tier,
            status: 'canceled',
            unitAmountCents: 0,
          });
        res.status(200).json({ status: 'canceled' });
      } catch (e) {
        next(e);
      }
    },
  );

  return router;
}

// ── Public webhooks (mount at '/v1/billing' BEFORE the global express.json) ──
// Razorpay  -> POST /v1/billing/webhook
// Cashfree  -> POST /v1/billing/webhook/cashfree
export function billingWebhookRouter(deps: BillingRouterDeps): Router {
  const router = Router();

  router.post(
    '/webhook',
    raw({ type: '*/*' }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
        const signature = req.header('x-razorpay-signature');
        if (!verifyWebhookSignature(rawBody, signature))
          throw new HttpProblem({ status: 401, title: 'Invalid webhook signature' });

        let event: {
          event?: string;
          payload?: Record<string, { entity?: Record<string, unknown> }>;
        };
        try {
          event = JSON.parse(rawBody);
        } catch {
          throw new HttpProblem({ status: 400, title: 'Malformed webhook body' });
        }

        const type = event.event ?? '';
        const subEntity = event.payload?.subscription?.entity as
          | Record<string, unknown>
          | undefined;
        const payEntity = event.payload?.payment?.entity as Record<string, unknown> | undefined;
        const rzpSubId =
          (subEntity?.id as string | undefined) ??
          (payEntity?.subscription_id as string | undefined);
        const tenantId = rzpSubId
          ? await findTenantByRazorpaySubscription(deps.pool, rzpSubId)
          : null;

        if (tenantId) {
          const customerId = await getCustomerIdByTenant(deps.pool, tenantId);
          if (customerId) {
            if (type === 'subscription.charged' || type === 'subscription.activated') {
              const planNotes = (subEntity?.notes as Record<string, string> | undefined)
                ?.qorium_plan;
              const tier = planNotes && isPlanId(planNotes) ? planNotes : 'growth';
              const currentEnd = subEntity?.current_end
                ? new Date((subEntity.current_end as number) * 1000)
                : null;
              await upsertSubscription(deps.pool, {
                customerId,
                tier,
                status: 'active',
                unitAmountCents: planUnitAmountCents(tier),
                razorpaySubscriptionId: rzpSubId ?? null,
                currentPeriodEnd: currentEnd,
              });
            } else if (type === 'subscription.cancelled' || type === 'subscription.completed') {
              await upsertSubscription(deps.pool, {
                customerId,
                tier: 'free',
                status: 'active',
                unitAmountCents: 0,
              });
            }
          }
        }
        res.status(200).json({ ok: true });
      } catch (e) {
        next(e);
      }
    },
  );

  router.post(
    '/webhook/cashfree',
    raw({ type: '*/*' }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
        const signature = req.header('x-webhook-signature');
        const timestamp = req.header('x-webhook-timestamp');
        if (!verifyCfWebhookSignature(rawBody, signature, timestamp))
          throw new HttpProblem({ status: 401, title: 'Invalid webhook signature' });

        let event: {
          type?: string;
          data?: { subscription?: Record<string, unknown> };
        };
        try {
          event = JSON.parse(rawBody);
        } catch {
          throw new HttpProblem({ status: 400, title: 'Malformed webhook body' });
        }

        const sub = event.data?.subscription;
        const cfSubId = sub?.subscription_id as string | undefined;
        const cfStatus = String(sub?.subscription_status ?? '').toUpperCase();
        const tenantId = cfSubId
          ? await findTenantByRazorpaySubscription(deps.pool, cfSubId)
          : null;

        if (tenantId) {
          const customerId = await getCustomerIdByTenant(deps.pool, tenantId);
          if (customerId) {
            if (cfStatus === 'ACTIVE') {
              const meta = sub?.subscription_meta as Record<string, string> | undefined;
              const planNotes = meta?.qorium_plan;
              const tier = planNotes && isPlanId(planNotes) ? planNotes : 'growth';
              await upsertSubscription(deps.pool, {
                customerId,
                tier,
                status: 'active',
                unitAmountCents: planUnitAmountCents(tier),
                razorpaySubscriptionId: cfSubId ?? null,
              });
            } else if (cfStatus === 'CANCELLED' || cfStatus === 'COMPLETED') {
              await upsertSubscription(deps.pool, {
                customerId,
                tier: 'free',
                status: 'active',
                unitAmountCents: 0,
              });
            }
          }
        }
        res.status(200).json({ ok: true });
      } catch (e) {
        next(e);
      }
    },
  );

  return router;
}

// Exported for diagnostics/tests: which provider routes subscribe calls today.
export { activeProviderName, getProvider };
