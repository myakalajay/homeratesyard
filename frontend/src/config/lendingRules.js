/**
 * 🏦 LENDING CONFIGURATION ENGINE (LEVEL-5)
 * Centralized governance for loan thresholds, compliance assumptions, and pricing spreads.
 * Enforced as Immutable Constants to ensure system-wide calculation integrity.
 * * @version 2026.1.0 (Production Certified)
 */

export const LOAN_LIMITS = Object.freeze({
  /**
   * 2026 Federal Housing Finance Agency (FHFA) Conforming Loan Limits
   * Standardized for One-Unit Properties.
   */
  BASELINE: 830000, // Updated for 2026 benchmark
  HIGH_COST: 1245000, // 150% of Baseline for designated high-cost areas
  
  /**
   * Compliance Geography Mapping
   * Designated high-cost jurisdictions requiring tiered underwriting.
   */
  HIGH_COST_JURISDICTIONS: [
    'CA', 'NY', 'NJ', 'MA', 'HI', 'DC', 'WA', 'VA', 'MD', 'AK', 'GU', 'VI'
  ],
});

export const UNDERWRITING_THRESHOLDS = Object.freeze({
  /**
   * Debt-to-Income (DTI) Ceilings
   * Aligned with Fannie Mae/Freddie Mac GSE guidelines.
   */
  DTI_CEILING_CONFORMING: 43, // Standard Qualified Mortgage (QM) limit
  DTI_CEILING_JUMBO: 40,      // Stricter limit for non-conforming assets
  
  /**
   * Loan-to-Value (LTV) Maximums
   */
  MAX_LTV_CONVENTIONAL: 97.0,
  MAX_LTV_JUMBO: 80.0,
  MAX_LTV_FHA: 96.5,
  MAX_LTV_VA: 100.0,
});

export const DEFAULT_ASSUMPTIONS = Object.freeze({
  CREDIT_SCORE: 740,            // Benchmark for "Excellent" tier pricing
  PROPERTY_TAX_RATE_AVG: 1.15,  // Annualized national average percentage
  HAZARD_INSURANCE_RATE: 0.35,  // Standardized annual estimate percentage
  HOA_DEFAULT_FEES: 0,
  
  /**
   * Private Mortgage Insurance (PMI) Monthly Factors
   * Computed as (Factor / 12) * Loan Amount
   */
  PMI_FACTORS: {
    ELITE: 0.0038,    // FICO 760+
    PREFERRED: 0.0055, // FICO 720-759
    STANDARD: 0.0085,  // FICO 680-719
    RECOVER: 0.0115,   // FICO <680
  }
});

/**
 * 📈 PRICING ADJUSTMENTS (BPS)
 * Basis point adjustments applied to base secondary market rates.
 * Format: Decimal representation of percentage points.
 */
export const MARKET_ADJUSTMENTS = Object.freeze({
  JUMBO_PREMIUM: 0.250,    // Spread for non-conforming risk
  FHA_ADJUSTMENT: -0.500,  // Government subsidy spread
  VA_ADJUSTMENT: -0.500,   // Veteran benefit spread
  ARM_ADJUSTMENT: -0.625,  // Initial teaser spread for variable products
  REFINANCE_SURCHARGE: 0.125 // Adverse market adjustment for refinance
});