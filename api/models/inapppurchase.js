const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inAppPurchaseSchema = new mongoose.Schema({
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    status: String,
    guid: String,
    amount: Number,
    payment_id: String,
    transaction_date: Date
});

module.exports = mongoose.model('in-app', inAppPurchaseSchema);