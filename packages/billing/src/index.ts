/**
 * @qorium/billing — pure-TS pricing + GST + HSN/SAC library.
 *
 * Pure data + math; no DB, no HTTP, no payment-provider SDKs. The
 * billing service (Razorpay / Stripe integration, webhooks, invoice PDF
 * generation) is a future sprint that depends on this library +
 * cred-drop. Sprint 2.2 per Auto-Mode Remote Plan §4 Phase D.
 */
export type {
  AnyTier,
  BillingCycle,
  BuyerProfile,
  Currency,
  IndianStateCode,
  InvoiceLine,
  InvoiceTotals,
  JdForgeTier,
  Money,
  ReadyBankTier,
  SacCode,
  SellerProfile,
  Sku,
  StackVaultTier,
  TaxBreakdown,
} from './types.js';
export {
  MINOR_UNITS,
  applyRate,
  formatMoney,
  money,
  moneyMinor,
  multiply,
  sumMoney,
} from './currency.js';
export {
  ALL_PRICES,
  JD_FORGE_PRICES,
  JD_FORGE_TIERS,
  READYBANK_PRICES,
  READYBANK_TIERS,
  STACK_VAULT_PRICES,
  STACK_VAULT_TIERS,
  defaultCurrencyForCountry,
  findPrice,
  validateAgainstFloor,
  type PriceEntry,
} from './sku-pricing.js';
export {
  DEFAULT_GST_RATE,
  GSTIN_REGEX,
  INDIAN_STATE_CODES,
  computeGst,
  stateName,
  validateGstin,
  type ComputeGstOptions,
  type GstinValidation,
} from './gst.js';
export { SAC_BY_SKU, SAC_ENTRIES, sacForSku } from './hsn-sac.js';
export {
  buildInvoice,
  renderInvoicePlain,
  type BuildInvoiceOptions,
  type BuildInvoiceResult,
  type LineInput,
} from './invoice.js';
