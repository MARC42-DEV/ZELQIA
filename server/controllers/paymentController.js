const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

exports.createOnlineOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receiptId } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receiptId
    };
    const order = await razorpay.orders.create(options);
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPaymentWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Cryptographic signature mismatch.' });
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        { paymentStatus: 'PAID', razorpayPaymentId: payment.id }
      );
    }
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyCodOrderOtp = async (req, res) => {
  const { orderId, otp, inputOtp } = req.body;
  if (parseInt(otp, 10) !== parseInt(inputOtp, 10)) {
    return res.status(400).json({ success: false, message: 'Invalid OTP entered.' });
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { orderId },
    { codOtpVerified: true, paymentStatus: 'VERIFIED_COD' },
    { new: true }
  );

  return res.status(200).json({ success: true, message: 'COD Verified.', order: updatedOrder });
};