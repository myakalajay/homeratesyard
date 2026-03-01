// Base Corporate Wrapper to ensure consistent branding across all emails
const baseWrapper = (bodyContent) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F4F7FA;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
    <tr><td align="center">
      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <tr>
          <td style="background-color: #0A1128; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">HomeRates<span style="color: #DC2626;">Yard</span></h1>
          </td>
        </tr>
        <tr><td style="padding: 40px 30px;">
          ${bodyContent}
        </td></tr>
        <tr>
          <td style="background-color: #F8FAFC; padding: 24px 30px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">Secure Communication from HomeRatesYard Enterprise.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const TEMPLATES = {
  PRE_APPROVAL: {
    trigger: 'loan_approved',
    subject: 'Congratulations {{user_name}}! Your Pre-Approval is Ready 🎉',
    html: baseWrapper(`
      <h2 style="color: #0A1128; margin-top: 0; font-size: 20px;">Great news, {{user_name}}!</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Your application has successfully passed our Automated Underwriting System (AUS). You are officially pre-approved for a loan amount up to <strong>{{loan_amount}}</strong>.
      </p>
      <table border="0" cellspacing="0" cellpadding="0"><tr>
        <td align="center" style="border-radius: 8px;" bgcolor="#DC2626">
          <a href="{{action_url}}" target="_blank" style="font-size: 15px; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 28px; display: inline-block;">Download Pre-Approval Letter</a>
        </td>
      </tr></table>
    `)
  },
  
  PASSWORD_RESET: {
    trigger: 'auth_password_reset',
    subject: 'Security Alert: Password Reset Requested 🔐',
    html: baseWrapper(`
      <div style="margin-bottom: 24px;"><span style="background-color: #FEF2F2; color: #DC2626; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Security Alert</span></div>
      <h2 style="color: #0A1128; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Hello {{user_name}},<br><br>We received a request to reset the password associated with your account. For security purposes, this link will expire in 15 minutes.
      </p>
      <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;"><tr>
        <td align="center" style="border-radius: 8px;" bgcolor="#0A1128">
          <a href="{{action_url}}" target="_blank" style="font-size: 15px; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 28px; display: inline-block;">Reset My Password</a>
        </td>
      </tr></table>
    `)
  }
};