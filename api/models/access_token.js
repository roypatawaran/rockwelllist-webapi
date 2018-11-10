var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var accessTokenSchema = new mongoose.Schema({
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
	access_token: String
});

module.exports = mongoose.model("access_token", accessTokenSchema);