var mongoose = require("mongoose");

var items_summarySchema = new mongoose.Schema({
	item_id: String,
    item_type: String,
    name:String,
    writeup:String,
    image_url: String,
    location: String
});

module.exports = mongoose.model("items_summary", items_summarySchema);