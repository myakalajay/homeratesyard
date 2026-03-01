/**
 * 🧠 AUTOMATED UNDERWRITING SYSTEM (AUS) - "Nano DU"
 * Enterprise Rules Engine for Mortgage Eligibility
 */

// --- Financial Math Helpers ---
const calculateMonthlyPayment = (amount, rate, years = 30) => {
    if (!amount || !rate || rate === 0) return amount / (years * 12);
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    // Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    return amount * monthlyRate * (Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
};

const calculateDTI = (monthlyDebt, newHousingPayment, monthlyIncome) => {
    if (!monthlyIncome || monthlyIncome <= 0) return 100.0;
    return ((monthlyDebt + newHousingPayment) / monthlyIncome) * 100;
};

const calculateLTV = (loanAmount, propertyValue) => {
    if (!propertyValue || propertyValue <= 0) return 100.0;
    return (loanAmount / propertyValue) * 100;
};

/**
 * Executes a waterfall decision based on credit, DTI, and LTV.
 */
exports.runDecisionEngine = (loan) => {
    const income = parseFloat(loan.monthlyIncome) || 0;
    const debts = parseFloat(loan.monthlyDebt) || 0;
    const credit = parseInt(loan.creditScore) || 0;
    const amount = parseFloat(loan.amount) || 0;
    const value = parseFloat(loan.propertyValue) || 0;
    const rate = 6.5; // Current Market Baseline

    const pAndI = calculateMonthlyPayment(amount, rate);
    const dti = calculateDTI(debts, pAndI, income);
    const ltv = calculateLTV(amount, value);

    let decision = {
        result: 'refer_caution',
        reason: 'Manual Underwriting Required',
        dti: parseFloat(dti.toFixed(2)),
        ltv: parseFloat(ltv.toFixed(2)),
        estimatedPayment: parseFloat(pAndI.toFixed(2)),
        creditScore: credit
    };

    // --- DECISION WATERFALL ---
    if (credit < 580) {
        decision.result = 'refer_ineligible';
        decision.reason = 'Credit Score below 580 baseline.';
    } else if (ltv > 97.0) {
        decision.result = 'refer_caution';
        decision.reason = 'LTV exceeds 97% limit.';
    } else if (credit >= 680 && dti <= 45.0 && ltv <= 95.0) {
        decision.result = 'approve_eligible';
        decision.reason = 'Meets Conventional Guidelines.';
    } else if (credit >= 720 && dti <= 50.0) {
        decision.result = 'approve_eligible';
        decision.reason = 'High-Credit Expanded Approval.';
    } else if (credit >= 620 && dti <= 55.0 && ltv <= 96.5) {
        decision.result = 'approve_eligible';
        decision.reason = 'FHA/Gov Eligible Guidelines.';
    }

    return decision;
};