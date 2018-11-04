const Egc = require('../models/egc');
const pagination = require('../utils/pagination');
var egc = require('../models/egc');
var mongoose = require('mongoose');

module.exports = {
    create_coupon: async (req, res, next) => {
        try {
            var dateToday = new Date(Date.now());
            var egc = new Egc({
                amount: 1500,
                claimed: false,
                created_date: dateToday,
                expiration_date: dateToday.setDate(dateToday.getMonth() + 2),
                name: "Rockwellist E-GC",
                tracking_id: "Code Sequence 1950-4772"
            }) 
            const _egc = await egc.save();
            res.status(201).json(_egc);
        } catch(err) {
            next(err);
        }
    }
}

