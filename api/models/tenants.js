const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tenantsSchema = new mongoose.Schema({
    item_type: String,
    render_type: String,
    name: {type: String, text: true},
    image_url: {
        type: String,
        default: null
    },
    writeup: String,
    description: String,
    featured: Boolean,
    location: String,
    phone_num: Array,
    rockwellist_picks: [{
        name: String,
        image_url:{
            type: String,
            default: null
        }
    }],
    similar_items: [{
        type: Schema.Types.ObjectId,
        ref: 'tenants'
    }],
    thumbnail_url: String
});

tenantsSchema.index({name: 'text'});

module.exports = mongoose.model('Tenants', tenantsSchema);