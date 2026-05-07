import type {
  AnyTier,
  BillingCycle,
  Currency,
  JdForgeTier,
  Money,
  ReadyBankTier,
  Sku,
  StackVaultTier,
} from './types.js';
import { money } from './currency.js';

/**
 * Canonical SKU pricing per Constitution §1.2 (LOCKED) and the live
 * Mission Control dashboard (Run #32). Mixed INR / USD on purpose:
 *   - Recruiter Subscription line and Stack-Vault are India-rupee
 *     (Indian recruiting market is the primary distribution).
 *   - Platform tier and JD-Forge international are USD (designed for
 *     enterprise GCC / global SaaS comparison).
 *
 * `floor` indicates pricing below which CEO sign-off is required (e.g.,
 * Stack-Vault Group has a ₹1Cr nominal but a ₹35L floor per dashboard).
 */
export interface PriceEntry {
  sku: Sku;
  tier: AnyTier;
  unitPrice: Money;
  cycle: BillingCycle;
  description: string;
  floor?: Money;
}

const inr = (amt: number) => money(amt, 'INR');
const usd = (amt: number) => money(amt, 'USD');

export const READYBANK_PRICES: ReadonlyArray<PriceEntry> = [
  {
    sku: 'readybank',
    tier: 'recruiter-solo',
    unitPrice: inr(4_999),
    cycle: 'monthly',
    description: 'ReadyBank · Recruiter Solo (₹4,999 / month)',
  },
  {
    sku: 'readybank',
    tier: 'recruiter-team',
    unitPrice: inr(19_999),
    cycle: 'monthly',
    description: 'ReadyBank · Recruiter Team (₹19,999 / month)',
  },
  {
    sku: 'readybank',
    tier: 'recruiter-enterprise',
    unitPrice: inr(49_999),
    cycle: 'monthly',
    description: 'ReadyBank · Recruiter Enterprise (₹49,999 / month)',
  },
  {
    sku: 'readybank',
    tier: 'platform-starter',
    unitPrice: usd(50_000),
    cycle: 'annual',
    description: 'ReadyBank API · Platform Starter ($50,000 / year)',
  },
  {
    sku: 'readybank',
    tier: 'platform-growth',
    unitPrice: usd(150_000),
    cycle: 'annual',
    description: 'ReadyBank API · Platform Growth ($150,000 / year)',
  },
  {
    sku: 'readybank',
    tier: 'platform-enterprise',
    unitPrice: usd(500_000),
    cycle: 'annual',
    description: 'ReadyBank API · Platform Enterprise ($500,000+ / year)',
    floor: usd(500_000),
  },
];

export const JD_FORGE_PRICES: ReadonlyArray<PriceEntry> = [
  {
    sku: 'jd-forge',
    tier: 'standard',
    unitPrice: usd(49),
    cycle: 'one-time',
    description: 'JD-Forge · Standard ($49 per JD)',
  },
  {
    sku: 'jd-forge',
    tier: 'reviewed',
    unitPrice: usd(199),
    cycle: 'one-time',
    description: 'JD-Forge · Reviewed ($199 per JD)',
  },
  {
    sku: 'jd-forge',
    tier: 'enterprise',
    unitPrice: usd(499),
    cycle: 'one-time',
    description: 'JD-Forge · Enterprise ($499 per JD)',
  },
  {
    sku: 'jd-forge',
    tier: 'sub-starter',
    unitPrice: usd(499),
    cycle: 'monthly',
    description: 'JD-Forge Subscription · Starter ($499 / month)',
  },
  {
    sku: 'jd-forge',
    tier: 'sub-growth',
    unitPrice: usd(1_999),
    cycle: 'monthly',
    description: 'JD-Forge Subscription · Growth ($1,999 / month)',
  },
  {
    sku: 'jd-forge',
    tier: 'sub-pro',
    unitPrice: usd(9_999),
    cycle: 'monthly',
    description: 'JD-Forge Subscription · Pro ($9,999 / month)',
  },
];

export const STACK_VAULT_PRICES: ReadonlyArray<PriceEntry> = [
  {
    sku: 'stack-vault',
    tier: 'department',
    unitPrice: inr(1_000_000), // ₹10 Lakh
    cycle: 'annual',
    description: 'Stack-Vault · Department (₹10L / year)',
  },
  {
    sku: 'stack-vault',
    tier: 'enterprise',
    unitPrice: inr(4_000_000), // ₹40 Lakh
    cycle: 'annual',
    description: 'Stack-Vault · Enterprise (₹40L / year)',
  },
  {
    sku: 'stack-vault',
    tier: 'group',
    unitPrice: inr(10_000_000), // ₹1 Crore nominal
    cycle: 'annual',
    description: 'Stack-Vault · Group (₹1Cr+ / year — ₹35L floor with CEO approval)',
    floor: inr(3_500_000), // ₹35 Lakh CEO-approval floor per dashboard
  },
];

export const ALL_PRICES: ReadonlyArray<PriceEntry> = [
  ...READYBANK_PRICES,
  ...JD_FORGE_PRICES,
  ...STACK_VAULT_PRICES,
];

/** Resolve a price entry from (sku, tier). Returns undefined for unknown
 *  combinations. */
export function findPrice(sku: Sku, tier: AnyTier): PriceEntry | undefined {
  return ALL_PRICES.find((p) => p.sku === sku && p.tier === tier);
}

/** Validate that a price doesn't fall below the SKU floor (for tiers
 *  that carry one). Returns null if valid; an error string otherwise. */
export function validateAgainstFloor(price: Money, entry: PriceEntry): string | null {
  if (!entry.floor) return null;
  if (entry.floor.currency !== price.currency) {
    return `currency mismatch: floor is ${entry.floor.currency}, price is ${price.currency}`;
  }
  if (price.amount < entry.floor.amount) {
    return `price ${price.amount} below floor ${entry.floor.amount} for ${entry.sku}/${entry.tier}`;
  }
  return null;
}

/** Currency picker — INR for Indian buyers, USD elsewhere by default.
 *  Override is honored when the customer explicitly requests cross-
 *  currency settlement (e.g., a UAE buyer paying USD for an INR-listed
 *  Stack-Vault SKU at a contracted FX rate). */
export function defaultCurrencyForCountry(countryIso2: string): Currency {
  return countryIso2.toUpperCase() === 'IN' ? 'INR' : 'USD';
}

/** Helpers for typed tier validation. */
export const READYBANK_TIERS: ReadyBankTier[] = [
  'recruiter-solo',
  'recruiter-team',
  'recruiter-enterprise',
  'platform-starter',
  'platform-growth',
  'platform-enterprise',
];
export const JD_FORGE_TIERS: JdForgeTier[] = [
  'standard',
  'reviewed',
  'enterprise',
  'sub-starter',
  'sub-growth',
  'sub-pro',
];
export const STACK_VAULT_TIERS: StackVaultTier[] = ['department', 'enterprise', 'group'];
