const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cinemasSchema = new mongoose.Schema({
    item_type: String,
    render_type: String,
    name: String,
    image_url:{
        type: String,
        default: null
    },
    writeup:{
        type: String,
        default: null
    },
    description:{
        type: String,
        default: null
    },
    trailer_url: String,
    genre:{
        type: String,
        default: null
    },
    mtrcb_rating: {
        type: String,
        default: null
    },
    availability: [{
        theater_name: String,
        opening_date: Date,
        end_date: Date
    }],
    booking_url: String,
    thumbnail_url: String
});

module.exports = mongoose.model('Cinemas', cinemasSchema);