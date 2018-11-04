const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const egcSchema = new mongoose.Schema({
    amount: Number,
    claimed: Boolean,
    created_date: Date,
    expiration_date: Date,
    name: String,
    tracking_id: String,
    qr_code: String
});

module.exports = mongoose.model('egc', egcSchema);