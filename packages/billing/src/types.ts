/**
 * Shared types for the QOrium billing library.
 *
 * Currency arithmetic is performed in **minor units** (paise for INR,
 * cents for USD) using `bigint` to avoid floating-point rounding error.
 * Display formatting converts to major units only at the boundary.
 */

export type Currency = 'INR' | 'USD';

export type Sku = 'readybank' | 'jd-forge' | 'stack-vault';

/** ReadyBank tier slugs. ReadyBank has both a Recruiter line (₹/mo) and
 *  a Platform line ($/yr) per Constitution §1.2 / live dashboard. */
export type ReadyBankTier =
  | 'recruiter-solo' // ₹4,999 / month
  | 'recruiter-team' // ₹19,999 / month
  | 'recruiter-enterprise' // ₹49,999 / month
  | 'platform-starter' // $50,000 / year
  | 'platform-growth' // $150,000 / year
  | 'platform-enterprise'; // $500,000 / year (floor)

export type JdForgeTier =
  | 'standard' // $49 / JD
  | 'reviewed' // $199 / JD
  | 'enterprise' // $499 / JD
  | 'sub-starter' // $499 / month
  | 'sub-growth' // $1,999 / month
  | 'sub-pro'; // $9,999 / month

export type StackVaultTier =
  | 'department' // ₹10L / year
  | 'enterprise' // ₹40L / year
  | 'group'; // ₹1Cr+ / year (floor; CEO approval required below ₹35L)

export type AnyTier = ReadyBankTier | JdForgeTier | StackVaultTier;

/** Billing cycle classifies the recurrence interval. */
export type BillingCycle = 'one-time' | 'monthly' | 'annual' | 'usage';

/** Money value held in minor units. Always non-negative. */
export interface Money {
  amount: bigint;
  currency: Currency;
}

/** Indian Sector Skills Council code is unrelated to HSN/SAC; this is
 *  the Service Accounting Code under GST. SaaS in India typically uses
 *  998314 (IT consulting and support services) or 998315 (hosting + IT
 *  infra provisioning). Codes here are CTO-tentative until GST counsel
 *  cross-checks. */
export interface SacCode {
  code: string;
  title: string;
  /** Verification stays `pending` until GST counsel signs off. */
  verification: 'pending' | 'verified';
}

/** Tax breakdown for a single line item. CGST + SGST applies for
 *  intra-state sales (seller and buyer in the same Indian state); IGST
 *  applies for inter-state sales OR sales to other countries. Export of
 *  services from India is zero-rated when the buyer is outside India and
 *  payment is in foreign currency. */
export interface TaxBreakdown {
  /** Effective combined rate as a decimal (0.18 = 18%). */
  totalRate: number;
  /** Breakdown into the three GST components in minor units. */
  cgst: bigint;
  sgst: bigint;
  igst: bigint;
  /** Sum of cgst + sgst + igst. */
  totalTax: bigint;
  /** GST classification for invoice rendering. */
  scheme: 'intra-state' | 'inter-state' | 'export-zero-rated' | 'non-india';
}

/** A line on an invoice. */
export interface InvoiceLine {
  description: string;
  sku: Sku;
  tier: AnyTier;
  sac: SacCode;
  quantity: number;
  unitPrice: Money;
  /** quantity * unitPrice */
  subtotal: Money;
  tax: TaxBreakdown;
  total: Money;
  cycle: BillingCycle;
  /** Period covered by this line, if applicable. ISO date strings. */
  periodStart?: string;
  periodEnd?: string;
}

/** A computed invoice. The package only does the math + structure;
 *  persistence + PDF rendering live in the billing service later. */
export interface InvoiceTotals {
  currency: Currency;
  subtotal: bigint;
  totalTax: bigint;
  grandTotal: bigint;
  scheme: TaxBreakdown['scheme'];
  lines: InvoiceLine[];
}

/** Indian state code (2-digit GST state code). E.g. 27 = Maharashtra,
 *  29 = Karnataka, 07 = Delhi. */
export type IndianStateCode = string;

/** Buyer profile used to determine GST scheme. */
export interface BuyerProfile {
  /** ISO-3166-1 alpha-2 country code. */
  country: string;
  /** GST state code if buyer is in India. */
  stateCode?: IndianStateCode;
  /** GSTIN if registered. Format validated by `validateGstin`. */
  gstin?: string;
}

/** Seller profile (Talpro / QOrium India). Currently fixed but
 *  parameterised so the same library can be used by sub-entities later. */
export interface SellerProfile {
  country: string;
  stateCode: IndianStateCode;
  gstin: string;
  legalName: string;
}
