const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appVersionSchema = new mongoose.Schema({
    android: Number,
    IOS: Number
});

module.exports = mongoose.model('app_version', appVersionSchema);