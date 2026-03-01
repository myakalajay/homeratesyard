const Joi = require('joi');

const loanApplicationSchema = Joi.object({
  // 💰 MONEY: Precision(2) prevents "100.999" (sub-cent amounts)
  amount: Joi.number()
    .positive()
    .min(50000) // Realistic minimum for mortgages
    .max(10000000) // Cap at $10M to prevent integer overflow attacks
    .precision(2)
    .required(),

  term: Joi.number()
    .integer()
    .valid(10, 15, 20, 30) // Restrict to standard mortgage terms
    .required(),

  loanType: Joi.string()
    .valid('mortgage', 'refinance', 'heloc', 'personal')
    .required(),

  // 🏠 PROPERTY: Required for Mortgages/HELOCs
  propertyAddress: Joi.when('loanType', {
      is: Joi.valid('mortgage', 'heloc', 'refinance'),
      then: Joi.string().min(10).required(),
      otherwise: Joi.string().optional()
  }),

  propertyValue: Joi.number()
    .positive()
    .precision(2)
    .required(), // Almost always required for LTV calc

  purpose: Joi.string()
    .max(500)
    .optional()
    .allow('')
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'submitted', 'under_review', 'conditional', 'approved', 'rejected', 'funded', 'archived')
    .required(),

  // 📝 NOTES: Essential for rejection reasons
  rejectionReason: Joi.when('status', {
      is: 'rejected',
      then: Joi.string().min(10).required(), // Force explanation if rejecting
      otherwise: Joi.string().optional().allow('')
  }),

  adminNotes: Joi.string().optional().allow('')
});

module.exports = { loanApplicationSchema, updateStatusSchema };