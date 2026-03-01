import { LOAN_LIMITS, DEFAULT_ASSUMPTIONS } from '@/config/lendingRules';

export const CalculationService = {
  /**
   * Calculate Monthly Principal & Interest (P&I)
   * Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
   */
  getMonthlyPI: (principal, annualRate, years) => {
    if (!principal || !annualRate || !years) return 0;
    
    const r = annualRate / 100 / 12; // Monthly interest rate
    const n = years * 12;            // Total number of payments
    
    // Standard Mortgage Formula
    const payment = principal * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    
    return Math.round(payment);
  },

  /**
   * Calculate Estimated PMI (Private Mortgage Insurance)
   * Rule: Required if LTV > 80% (Down Payment < 20%)
   * Uses credit score tiers from DEFAULT_ASSUMPTIONS.
   */
  getEstimatedPMI: (loanAmount, homePrice, creditScore) => {
    const ltv = (loanAmount / homePrice) * 100;

    // PMI is automatically removed if LTV is 80% or lower
    if (ltv <= 80) return 0;

    // Use Rates from Config, fallback to hardcoded if config missing
    const rates = DEFAULT_ASSUMPTIONS.PMI_RATES || {
      EXCELLENT: 0.0038, GOOD: 0.0055, FAIR: 0.0085, POOR: 0.0115
    };

    let annualRate = rates.POOR;
    if (creditScore >= 760) annualRate = rates.EXCELLENT;
    else if (creditScore >= 720) annualRate = rates.GOOD;
    else if (creditScore >= 680) annualRate = rates.FAIR;

    // Monthly PMI = (Loan Amount * Annual Rate) / 12
    return Math.round((loanAmount * annualRate) / 12);
  },

  /**
   * Calculate Total Monthly Payment
   * Now accepts pre-calculated components for flexibility
   */
  getTotalMonthly: (pi, tax, insurance, hoa, pmi) => {
    return Math.round(pi + tax + insurance + hoa + pmi);
  },

  /**
   * Determine Loan Type (Conforming vs Jumbo vs High-Balance)
   */
  getLoanCategory: (amount, stateCode) => {
    const isHighCostState = LOAN_LIMITS.HIGH_COST_STATES.includes(stateCode);
    const limit = isHighCostState ? LOAN_LIMITS.HIGH_COST : LOAN_LIMITS.BASELINE;

    if (amount > limit) return 'Jumbo';
    if (isHighCostState && amount > LOAN_LIMITS.BASELINE) return 'High-Balance';
    return 'Conforming';
  },

  /**
   * Estimate Monthly Property Tax
   */
  getEstimatedTax: (homeValue) => {
    return Math.round((homeValue * (DEFAULT_ASSUMPTIONS.PROPERTY_TAX_RATE / 100)) / 12);
  },

  /**
   * Estimate Monthly Home Insurance
   */
  getEstimatedInsurance: (homeValue) => {
    return Math.round((homeValue * (DEFAULT_ASSUMPTIONS.INSURANCE_RATE / 100)) / 12);
  },

  /**
   * ADVANCED: Calculate Amortization with Extra Payments
   * Used to determine "Savings" and "Early Payoff Date"
   * Returns: { schedule, totalInterest, payoffMonths, savings, baselineInterest }
   */
  calculateAmortization: (principal, annualRate, years, extraMonthly = 0) => {
    if (!principal || !annualRate || !years) return { totalInterest: 0, savings: 0, payoffMonths: 0 };

    let balance = principal;
    const r = annualRate / 100 / 12;
    const n = years * 12;
    
    // Calculate standard payment without rounding for internal accuracy
    const scheduledPayment = principal * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    
    let totalInterest = 0;
    let months = 0;
    const schedule = []; // Can be used for graphs later

    // Loop until paid off
    while (balance > 0 && months <= n) {
      const interest = balance * r;
      const principalPart = scheduledPayment - interest;
      
      // Add extra payment to principal reduction
      let actualPrincipal = principalPart + extraMonthly;
      
      // Handle last payment logic
      if (balance - actualPrincipal < 0) {
        actualPrincipal = balance;
      }

      balance -= actualPrincipal;
      totalInterest += interest;
      months++;

      // Optional: Store yearly snapshots for graphs if needed
      // if (months % 12 === 0) schedule.push({ month: months, balance, interest });
    }

    // Calculate Baseline (No extra payment) for comparison
    const baselineInterest = (scheduledPayment * n) - principal;
    const savings = Math.max(0, baselineInterest - totalInterest);

    return {
      schedule,
      totalInterest: Math.round(totalInterest),
      payoffMonths: months,
      savings: Math.round(savings),
      baselineInterest: Math.round(baselineInterest)
    };
  }
};