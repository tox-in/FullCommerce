const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Method to calculate total amount
cartSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    this.lastUpdated = Date.now();
};

// Method to add item to cart
cartSchema.methods.addItem = async function (product, quantity = 1) {
    const existingItem = this.items.find(item => item.product.toString() === product._id.toString());

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: product._id,
            quantity,
            price: product.price,
            name: product.name,
            image: product.images[0],
        });
    }

    this.calculateTotal();
    await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function (productId) {
    this.items = this.items.filter(item => item.product.toString() !== productId.toString());
    this.calculateTotal();
    await this.save();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = async function (productId, quantity) {
    const item = this.items.find(item => item.product.toString() === productId.toString());
    if (item) {
        item.quantity = quantity;
        this.calculateTotal();
        await this.save();
    }
};

// Method to clear cart
cartSchema.methods.clear = async function () {
    this.items = [];
    this.totalAmount = 0;
    this.lastUpdated = Date.now();
    await this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 