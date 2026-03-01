/**
 * @class PaymentService
 * @desc  Abstracts the Payment Gateway (Stripe/Dwolla) interactions.
 * Currently running in 'MOCK_MODE' for development.
 */
class PaymentService {
    
    constructor() {
        this.currency = 'usd';
        // this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
  
    /**
     * Process a Charge
     * @param {number} amount - Amount in dollars (will be converted to cents)
     * @param {string} source - Token or PaymentMethod ID (e.g., 'tok_visa')
     * @param {string} description - Description for the statement
     */
    async charge(amount, source, description) {
        // ------------------------------------------
        // 🛑 REAL IMPLEMENTATION (Commented Out)
        // ------------------------------------------
        /*
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: this.currency,
                payment_method: source,
                description: description,
                confirm: true
            });
            return {
                success: true,
                transactionId: paymentIntent.id,
                status: paymentIntent.status,
                raw: paymentIntent
            };
        } catch (error) {
            console.error("Stripe Charge Error:", error);
            throw new Error(error.message);
        }
        */
  
        // ------------------------------------------
        // 🧪 MOCK IMPLEMENTATION (Simulated)
        // ------------------------------------------
        return new Promise((resolve, reject) => {
            console.log(`[PAYMENT GATEWAY] Processing charge of $${amount}...`);
            
            // Simulate Network Latency (500ms - 1500ms)
            const latency = Math.floor(Math.random() * 1000) + 500;
            
            setTimeout(() => {
                // Simulate 5% Random Failure Rate
                const isSuccess = Math.random() > 0.05; 
  
                if (isSuccess) {
                    resolve({
                        success: true,
                        transactionId: `txn_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                        status: 'succeeded',
                        timestamp: new Date()
                    });
                } else {
                    reject(new Error('Card declined: Insufficient funds (Mock)'));
                }
            }, latency);
        });
    }
  
    /**
     * Issue a Refund
     * @param {string} transactionId 
     */
    async refund(transactionId) {
        console.log(`[PAYMENT GATEWAY] Refunding transaction ${transactionId}...`);
        return {
            success: true,
            refundId: `ref_mock_${Date.now()}`,
            status: 'refunded'
        };
    }
}
  
module.exports = new PaymentService();