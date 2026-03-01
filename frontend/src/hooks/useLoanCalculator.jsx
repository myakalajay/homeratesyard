import { useState, useMemo } from 'react';

export const useLoanCalculator = (initialAmount = 450000) => {
  const [loanAmount, setLoanAmount] = useState(initialAmount);

  const metrics = useMemo(() => {
    // Business Logic: 
    // Traditional lenders charge ~1% origination + processing fees.
    // Plus ~1.5% in inefficiencies/buffers. Total ~2.5% closing costs.
    const traditionalCost = Math.round(loanAmount * 0.025); 
    
    // Our flat fee model
    const ourCost = 1500; 
    
    // Net Savings
    const savings = traditionalCost - ourCost;

    // Percentage for Slider UI (Min 100k, Max 2M)
    const sliderPercentage = ((loanAmount - 100000) / (2000000 - 100000)) * 100;

    return {
      traditionalCost,
      ourCost,
      savings,
      sliderPercentage
    };
  }, [loanAmount]);

  const formatMoney = (val) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);

  return {
    loanAmount,
    setLoanAmount,
    ...metrics,
    formatMoney
  };
};