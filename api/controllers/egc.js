var Egc = require('../models/egc');
var pagination = require('../utils/pagination');
var egc = require('../models/egc');
var mongoose = require('mongoose');

module.exports = {
    create_coupon: async (req, res, next) => {
        try {
            var dateToday = new Date(Date.now());
            var egc = new Egc({
                amount: 1,
                claimed: false,
                created_date: dateToday,
                expiration_date: dateToday.setDate(dateToday.getMonth() + 2),
                name: "Rockwellist E-GC",
                tracking_id: "123456789"
            }) 
            var _egc = await egc.save();
            res.status(201).json(_egc);
        } catch(err) {
            next(err);
        }
    },
    getCouponDetails: async (req, res, next) => {
        try{
            var coupon_id = req.params.coupon_id;
            var egc = await Egc.find({tracking_id: coupon_id});
            if(egc.length > 0){
                var _egc = {
                    _id: egc[0]._id,
                    tracking_id: egc[0].tracking_id,
                    credit_amount: egc[0].amount,
                    claimed: egc[0].claimed
                }
                res.status(200).send(_egc);
            }
            else{
                res.status(404).send({message: "Resource under given ID does not exist"});
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }
}

