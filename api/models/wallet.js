const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new mongoose.Schema({
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
});

module.exports = mongoose.model('wallet', walletSchema);