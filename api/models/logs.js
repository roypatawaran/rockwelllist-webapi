var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var logsSchema = new mongoose.Schema({
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    message: String,
    type: String,
    date_created: Date
});

module.exports = mongoose.model("logs", logsSchema);