const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    name: String,
    image: String,
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['CREDIT_CARD', 'PAYPAL', 'CRYPTO'],
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    notes: String,
}, {
    timestamps: true,
});

// Method to calculate total amount
orderSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};

// Method to update order status
orderSchema.methods.updateStatus = async function (newStatus) {
    this.orderStatus = newStatus;
    if (newStatus === 'SHIPPED') {
        this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
    await this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 