const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletPaymentsSchema = new mongoose.Schema({
    wallet: [{
        type: Schema.Types.ObjectId,
        ref: 'wallet'
    }],
    tenant: [{
        type: Schema.Types.ObjectId,
        ref: 'Tenants'
    }],
    amount: Number,
    tracking_id: String,
    transaction_date: Date,
    isSuccess: Boolean
});

module.exports = mongoose.model('wallet_payment', walletPaymentsSchema);