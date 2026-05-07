import type { BuyerProfile, Money, SellerProfile, TaxBreakdown } from './types.js';
import { applyRate } from './currency.js';

/**
 * GST calculation per India GST Act 2017.
 *
 *   intra-state (seller and buyer same state): CGST + SGST = total rate
 *   inter-state (different Indian states):     IGST = total rate
 *   export of services (buyer outside India):  zero-rated when payment in
 *                                              foreign currency + valid LUT;
 *                                              we mark as export-zero-rated
 *                                              and emit 0 tax
 *   non-India buyer in INR or no LUT:          treat as inter-state IGST
 *
 * Default service rate is 18% (CGST 9 + SGST 9, OR IGST 18).
 * Reduced 5% / 12% / 28% slabs apply to specific HSN codes — out of
 * scope for v0 (educational / SaaS services are uniformly 18%).
 */

export const DEFAULT_GST_RATE = 0.18; // 18%

export interface ComputeGstOptions {
  rate?: number;
  /** Treat foreign-currency payments to non-India buyers as zero-rated
   *  exports (default true). Set false to force IGST on USD invoices to
   *  international buyers without an LUT. */
  zeroRateExports?: boolean;
}

export function computeGst(
  taxableAmount: Money,
  buyer: BuyerProfile,
  seller: SellerProfile,
  options: ComputeGstOptions = {},
): TaxBreakdown {
  const rate = options.rate ?? DEFAULT_GST_RATE;
  const zeroRateExports = options.zeroRateExports ?? true;

  const buyerCountry = buyer.country.toUpperCase();
  const sellerCountry = seller.country.toUpperCase();

  // Buyer outside India.
  if (buyerCountry !== 'IN') {
    if (zeroRateExports && taxableAmount.currency !== 'INR') {
      return {
        totalRate: 0,
        cgst: 0n,
        sgst: 0n,
        igst: 0n,
        totalTax: 0n,
        scheme: 'export-zero-rated',
      };
    }
    // Otherwise charge IGST.
    const igst = applyRate(taxableAmount, rate).amount;
    return {
      totalRate: rate,
      cgst: 0n,
      sgst: 0n,
      igst,
      totalTax: igst,
      scheme: 'non-india',
    };
  }

  // Buyer inside India: intra vs inter state.
  const sameState = !!(
    buyer.stateCode &&
    seller.stateCode &&
    sellerCountry === 'IN' &&
    buyer.stateCode === seller.stateCode
  );

  if (sameState) {
    const halfRate = rate / 2;
    const cgst = applyRate(taxableAmount, halfRate).amount;
    const sgst = applyRate(taxableAmount, halfRate).amount;
    return {
      totalRate: rate,
      cgst,
      sgst,
      igst: 0n,
      totalTax: cgst + sgst,
      scheme: 'intra-state',
    };
  }

  const igst = applyRate(taxableAmount, rate).amount;
  return {
    totalRate: rate,
    cgst: 0n,
    sgst: 0n,
    igst,
    totalTax: igst,
    scheme: 'inter-state',
  };
}

/**
 * GSTIN format validation. The 15-character format is:
 *
 *   [SS][PPPPPPPPPP][E][Z][C]
 *
 *     SS  = 2-digit state code (01–37 plus a few special codes)
 *     PPPPPPPPPP = PAN (5 letters, 4 digits, 1 letter)
 *     E   = entity code (1 alphanumeric)
 *     Z   = literal 'Z'
 *     C   = checksum (1 alphanumeric)
 *
 * Spec: GSTN India "GSTIN structure" notification.
 *
 * v0 validates structure only. Live status check via the public GSTIN API
 * is deferred until cred-drop (the API requires registered access).
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

export interface GstinValidation {
  valid: boolean;
  reason?: string;
  stateCode?: string;
  pan?: string;
}

export function validateGstin(gstin: string): GstinValidation {
  if (typeof gstin !== 'string' || gstin.length !== 15) {
    return { valid: false, reason: 'GSTIN must be 15 characters' };
  }
  const upper = gstin.toUpperCase();
  if (!GSTIN_REGEX.test(upper)) {
    return { valid: false, reason: 'GSTIN format invalid' };
  }
  const stateCode = upper.slice(0, 2);
  const pan = upper.slice(2, 12);
  return { valid: true, stateCode, pan };
}

/** Indian GST state codes (subset; full list in GSTN spec). Used for
 *  display and intra-state inference. */
export const INDIAN_STATE_CODES: Readonly<Record<string, string>> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

export function stateName(code: string): string | undefined {
  return INDIAN_STATE_CODES[code];
}
