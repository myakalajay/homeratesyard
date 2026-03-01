/**
 * Standardized Mortgage Calculation Module
 * Centralizes math logic to ensure consistency across all pages.
 */

// Calculates monthly Principal & Interest
export const calculateMonthlyPI = (principal, annualRate, termYears) => {
  if (!principal || !annualRate || !termYears) return 0;
  
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  
  // Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

// Calculates total cost of loan
export const calculateTotalCost = (monthlyPayment, termYears, principal) => {
  if (!monthlyPayment || !termYears || !principal) return 0;
  const totalPaid = monthlyPayment * termYears * 12;
  return totalPaid - principal; // Total Interest
};

// Determines conforming loan limit status (2024 Baseline)
export const getLoanLimitStatus = (loanAmount, locationState = null) => {
  // 2024 Baseline Conforming Limit
  const BASE_LIMIT = 766550;
  
  // High-cost area logic (Simplified for frontend)
  const HIGH_COST_STATES = ['CA', 'NY', 'NJ', 'MA', 'HI', 'DC', 'VA', 'MD'];
  const HIGH_COST_LIMIT = 1149825; // 150% of baseline

  const limit = locationState && HIGH_COST_STATES.includes(locationState) 
    ? HIGH_COST_LIMIT 
    : BASE_LIMIT;

  return {
    isJumbo: loanAmount > limit,
    limit: limit,
    limitType: limit === HIGH_COST_LIMIT ? 'High-Cost' : 'Standard'
  };
};