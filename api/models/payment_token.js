const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentTokenSchema = new mongoose.Schema({
    date_expires: Date,
    date_generated: Date,
    qr_code: String,
    wallet_payment: [{
        type: Schema.Types.ObjectId,
        ref: 'wallet_payment'
    }],
});

module.exports = mongoose.model('payment_token', paymentTokenSchema);