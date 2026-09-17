const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  metalTone: {
    type: String,
    enum: ['Yellow Gold', 'Rose Gold', '925 Silver'],
    required: true
  },
  sku: { type: String, required: true, unique: true },
  images: [{ type: String, required: true }],
  hoverVideo: { type: String },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  stock: { type: Number, default: 0, min: 0 }
});

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Men'],
      required: true
    },
    description: { type: String, required: true },
    purity: { type: String, default: '18K Gold Plated / 925 Sterling Silver' },
    variants: [VariantSchema],
    tags: [String],
    isAntiTarnish: { type: Boolean, default: true },
    isHallmarked: { type: Boolean, default: true },
    warrantyMonths: { type: Number, default: 12 },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', ProductSchema);