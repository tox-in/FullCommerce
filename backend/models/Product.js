const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required'],
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for text search
productSchema.index({ name: 'text', description: 'text' });

// Method to update average rating
productSchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
    return;
  }
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.ratings.average = sum / this.reviews.length;
  this.ratings.count = this.reviews.length;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 