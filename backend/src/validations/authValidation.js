const Joi = require('joi');

/**
 * Password Complexity Regex:
 * At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters'
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // Allow all TLDs, but validate format
    .required()
    .lowercase()
    .trim(),

  password: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.pattern.base': 'Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.'
    }),

  // 🛡️ SECURITY: Prevent users from self-assigning 'admin' or 'super_admin'
  // Only 'borrower' is allowed for public registration. 
  // Lenders must be invited or upgraded by Admin.
  role: Joi.string()
    .valid('borrower') 
    .default('borrower')
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .trim(),
    
  // Login password doesn't need complexity check, just existence
  password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };