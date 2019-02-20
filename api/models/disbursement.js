const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var disbursementSchema = new mongoose.Schema({
    xml: String,
    status: String,
    request_id: String,
    transaction_date: Date
});

module.exports = mongoose.model("disbursement", disbursementSchema);