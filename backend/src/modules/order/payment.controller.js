const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('./order.model');
const orderService = require('./order.service');

// Lazy singleton so env vars are guaranteed to be loaded before first use
let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: (process.env.RAZORPAY_KEY_ID || '').trim(),
      key_secret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
    });
  }
  return _razorpay;
}

class PaymentController {
  /**
   * Create a Razorpay order — called before opening the Razorpay checkout popup.
   * Request body: { amount (in INR), currency? }
   */
  async createRazorpayOrder(req, res) {
    try {
      const { amount, currency = 'INR', notes = {} } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid amount is required' });
      }

      const options = {
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes,
      };

      const razorpayOrder = await getRazorpay().orders.create(options);

      return res.status(200).json({
        success: true,
        data: {
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
        },
      });
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return res.status(500).json({ success: false, message: error.error?.description || 'Failed to create payment order' });
    }
  }

  /**
   * Verify Razorpay payment signature, then create the order in DB.
   * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData }
   */
  async verifyPaymentAndCreateOrder(req, res) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderData) {
        return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
      }

      // Verify signature
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', (process.env.RAZORPAY_KEY_SECRET || '').trim())
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
      }

      // Inject Razorpay payment details into paymentDetails and mark as completed
      orderData.paymentStatus = 'completed';
      orderData.paymentDetails = {
        ...(orderData.paymentDetails || {}),
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      };

      const result = await orderService.createOrder(req.userId, orderData);
      return res.status(201).json(result);
    } catch (error) {
      console.error('Payment verification/order creation error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to verify payment' });
    }
  }

  /**
   * Store a failed/cancelled payment record (optional — just logs; order not created).
   * Body: { razorpayOrderId, reason }
   */
  async handlePaymentFailure(req, res) {
    try {
      const { razorpayOrderId, reason } = req.body;
      console.warn(`Payment failed. Razorpay Order: ${razorpayOrderId}. Reason: ${reason}`);
      return res.status(200).json({ success: true, message: 'Payment failure noted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PaymentController();
