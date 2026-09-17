const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: {
      phone: { type: String, required: true },
      email: { type: String },
      name: { type: String, required: true }
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variantSku: String,
        metalTone: String,
        quantity: { type: Number, default: 1 },
        price: Number
      }
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    isGiftPackaging: { type: Boolean, default: false },
    giftMessage: { type: String, maxLength: 200 },
    paymentMethod: {
      type: String,
      enum: ['UPI_CARDS', 'COD'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'VERIFIED_COD'],
      default: 'PENDING'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    pricing: {
      subtotal: Number,
      discount: Number,
      giftWrapFee: Number,
      codFee: Number,
      total: Number
    },
    codOtpVerified: { type: Boolean, default: false },
    orderStatus: {
      type: String,
      enum: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'CANCELLED'],
      default: 'PROCESSING'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);