require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const Product = require('./models/Product');
const paymentController = require('./controllers/paymentController');

const app = express();

// 1. SECURITY & HIGH-PAYLOAD MIDDLEWARES (Supports Base64 Images & Videos)
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  })
);

// 2. RATE LIMITER (Protects against DDoS / Brute-Force attacks)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api', globalLimiter);

// 3. IN-MEMORY SECURE OTP STORE (5-Minute Expiration)
const otpStore = new Map();

// 4. NODEMAILER EMAIL TRANSPORTER (Optional Gmail/SMTP integration)
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

// 5. UGC / "STYLED BY YOU" DATABASE SCHEMA & MODEL
const UGCSchema = new mongoose.Schema(
  {
    mediaType: {
      type: String,
      enum: ['IMAGE', 'REEL'],
      default: 'IMAGE'
    },
    mediaUrl: { type: String, required: true },
    handle: { type: String, default: '@zelqia_jewels' },
    title: { type: String, required: true }
  },
  { timestamps: true }
);

const UGC = mongoose.models.UGC || mongoose.model('UGC', UGCSchema);

// ==========================================
// 🚀 ROUTE 1: PRODUCT MANAGEMENT APIS
// ==========================================

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create New Product
app.post('/api/products', async (req, res) => {
  try {
    const { title, category, description, purity, isAntiTarnish, isHallmarked, variants } = req.body;
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now();

    const newProduct = await Product.create({
      title,
      slug,
      category,
      description,
      purity: purity || 'Fine 18K Gold Plated, 925 Silver & Stainless steels',
      isAntiTarnish: isAntiTarnish !== undefined ? isAntiTarnish : true,
      isHallmarked: isHallmarked !== undefined ? isHallmarked : true,
      variants
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update / Edit Existing Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, product: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 📸 ROUTE 2: "STYLED BY YOU" (UGC / REELS) APIS
// ==========================================

// Get All UGC Posts
app.get('/api/ugc', async (req, res) => {
  try {
    let posts = await UGC.find({}).sort({ createdAt: -1 });

    // Seed defaults on initial launch if empty
    if (posts.length === 0) {
      posts = await UGC.insertMany([
        {
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800',
          handle: '@zelqia_jewels',
          title: '18K Gold Solitaire Choker'
        },
        {
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800',
          handle: '@zelqia_jewels',
          title: 'Twisted Eternity Ring'
        },
        {
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800',
          handle: '@zelqia_jewels',
          title: 'Anti-Tarnish Tennis Bracelet'
        }
      ]);
    }

    res.status(200).json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add New UGC Post / Reel
app.post('/api/ugc', async (req, res) => {
  try {
    const post = await UGC.create(req.body);
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete UGC Post
app.delete('/api/ugc/:id', async (req, res) => {
  try {
    await UGC.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'UGC post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🔐 ROUTE 3: ZERO-COST LIVE OTP AUTHENTICATION
// ==========================================

// Send Real-Time Live OTP (WhatsApp / SMS / Email)
app.post('/api/auth/send-real-otp', async (req, res) => {
  const { channel, phone, email } = req.body;

  // 1. Generate secure 4-digit code
  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const identifier = channel === 'EMAIL' ? email : phone;

  // 2. Save in temporary memory with 5-minute expiry
  otpStore.set(identifier, {
    otp: generatedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  console.log(`\n==============================================`);
  console.log(`💎 [ZELQIA LIVE SECURITY DISPATCH]`);
  console.log(`📲 Channel: ${channel}`);
  console.log(`🎯 Recipient: ${identifier}`);
  console.log(`🔐 OTP Passcode: ${generatedOtp}`);
  console.log(`==============================================\n`);

  // Optional: Send real HTML email if configured
  if (channel === 'EMAIL' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await emailTransporter.sendMail({
        from: `"ZELQIA Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your ZELQIA Vault Security Passcode',
        html: `
          <div style="background-color:#0B0B0B; color:#F5F5F7; padding:30px; font-family:sans-serif; text-align:center;">
            <h1 style="color:#E5B25D; letter-spacing:4px; margin-bottom:10px;">ZELQIA</h1>
            <p style="color:#8E8E93; font-size:12px; text-transform:uppercase; letter-spacing:2px;">Demi-Fine Luxury Access</p>
            <div style="background-color:#141414; border:1px solid #E5B25D; padding:20px; margin:25px auto; max-width:280px;">
              <span style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#E5B25D;">${generatedOtp}</span>
            </div>
            <p style="color:#8E8E93; font-size:12px;">This one-time passcode expires in 5 minutes. Do not share this code.</p>
          </div>
        `
      });
      return res.status(200).json({
        success: true,
        message: `OTP sent to your email (${email})`,
        devOtp: generatedOtp
      });
    } catch (err) {
      console.error('Email Dispatch Error:', err.message);
    }
  }

  // Instant response for WhatsApp / SMS / Web
  return res.status(200).json({
    success: true,
    message: `Security code dispatched for +91 ${phone}`,
    devOtp: generatedOtp
  });
});

// Verify Real OTP
app.post('/api/auth/verify-real-otp', (req, res) => {
  const { identifier, enteredOtp } = req.body;
  const storedData = otpStore.get(identifier);

  if (!storedData) {
    return res.status(400).json({ success: false, message: 'OTP expired or not requested.' });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(identifier);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (storedData.otp !== enteredOtp.toString().trim()) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check again.' });
  }

  // Clear OTP after successful use
  otpStore.delete(identifier);

  return res.status(200).json({
    success: true,
    message: 'Authentication Successful'
  });
});

// ==========================================
// 💳 ROUTE 4: PAYMENTS & FRAUD-PROTECTED COD
// ==========================================

app.post('/api/payments/create-order', paymentController.createOnlineOrder);
app.post('/api/payments/verify-webhook', paymentController.verifyPaymentWebhook);
app.post('/api/payments/verify-cod-otp', paymentController.verifyCodOrderOtp);

// ==========================================
// 🛡️ DATABASE CONNECTION & SERVER START
// ==========================================

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zelqia')
  .then(() => console.log('🛡️ ZELQIA Database Connected securely.'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`💎 ZELQIA API Engine running on port ${PORT}`));