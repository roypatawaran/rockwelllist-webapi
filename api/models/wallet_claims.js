const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletClaimsSchema = new mongoose.Schema({
    egc: [{
        type: Schema.Types.ObjectId,
        ref: 'egc'
    }],
    wallet: [{
        type: Schema.Types.ObjectId,
        ref: 'wallet'
    }],
    amount: Number,
    transaction_date: Date,
    status: String,
    apppurchase: [{
        type: Schema.Types.ObjectId,
        ref: 'in-app'
    }]
});

module.exports = mongoose.model('wallet_claims', walletClaimsSchema);