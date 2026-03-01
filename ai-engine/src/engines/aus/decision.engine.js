/**
 * 🧠 NANO-DU DECISION ENGINE v2.0
 * Pure logic for mortgage asset eligibility.
 */

const calculateMonthlyPayment = (amount, rate, term = 30) => {
    if (!amount || !rate) return amount / (term * 12);
    const i = rate / 100 / 12;
    const n = term * 12;
    return amount * i * (Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
};

exports.evaluateAsset = (data) => {
    const { income, debt, credit, amount, value } = data;
    const rate = 6.75; // System baseline rate

    const pAndI = calculateMonthlyPayment(amount, rate);
    const dti = ((debt + pAndI) / income) * 100;
    const ltv = (amount / value) * 100;

    const metrics = {
        dti: parseFloat(dti.toFixed(2)),
        ltv: parseFloat(ltv.toFixed(2)),
        payment: parseFloat(pAndI.toFixed(2)),
        score: credit
    };

    // --- WATERFALL LOGIC ---
    if (credit < 620) return { result: 'INELIGIBLE', reason: 'Credit below floor.', metrics };
    if (ltv > 97) return { result: 'HIGH_RISK', reason: 'LTV exceeds maximum.', metrics };
    if (dti > 50) return { result: 'DEBT_RATIO_EXCEEDED', reason: 'DTI too high.', metrics };

    if (credit >= 740 && dti <= 36) return { result: 'ELITE_APPROVAL', reason: 'Preferred pricing tier.', metrics };
    
    return { result: 'STANDARD_APPROVAL', reason: 'Meets baseline guidelines.', metrics };
};