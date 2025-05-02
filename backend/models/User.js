const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/roles');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    match: [passwordRegex, 'Password must include upper, lower, digit, and special character'],
    select: false,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.CUSTOMER,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  profile: {
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    avatar: String,
  },
  sellerProfile: {
    storeName: String,
    storeDescription: String,
    storeLogo: String,
    storeBanner: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [String],
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function (next) {
    if (this.role !== ROLES.SELLER && this.sellerProfile) {
        this.invalidate('sellerProfile', 'Only sellers can have a seller profile');
    }
    next();
});


// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is seller
userSchema.methods.isSeller = function() {
  return this.role === ROLES.SELLER;
};

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN;
};

// Check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === ROLES.SUPER_ADMIN;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 