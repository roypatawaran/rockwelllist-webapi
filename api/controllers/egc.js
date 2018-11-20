var Egc = require('../models/egc');
var pagination = require('../utils/pagination');
var egc = require('../models/egc');
var logs = require('../models/logs');
var User = require('../models/user');
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
    },
    load_egc: async (req, res, next) => {
        try{
            var amount = req.body.amount;
            var query = JSON.parse(req.body.tracking_id);
            var tracking_id = req.body.tracking_id.split(':');
            tracking_id = tracking_id[1].replace('}', '').replace(' ', '').replace("'", "").replace("'", '');
            var user = await User.findById("5ba3b134e67666055004204e");
            var egc = await Egc.findOne(query);
            if(egc){
                egc = await Egc.findByIdAndUpdate(egc._id, {amount: amount});
                var _logs = new logs({
                    user: user,
                    type: 'EGC',
                    message: amount + " PHP was loaded to E-GC with tracking id: " + tracking_id,
                    date_created: new Date()
                });

                _logs = await _logs.save();
            
                res.send({message: "Load successfully"})
            }
            else{
                res.status(404).send({message: "No EG-C found with " + query.tracking_id});
            }
        }
        catch(err){
            console.log(err);
            res.send({message: "Error: Invalid E-GC transaction code"});
        }
    },
    load_transactions: async (req, res, next) => {
        try{
            var user = await User.findById("5ba3b134e67666055004204e");
            var _logs = await logs.find({user: user, type: 'EGC'});
            var transactions = [];

            _logs.forEach(element => {
                var trans = {
                    user: user.firstName + " " + user.lastName,
                    message: element.message,
                    date_created: element.date_created
                };
                transactions.push(trans);
            });
            res.send(transactions);
        }
        catch(err){
            console.log(err);
            var obj = {
                "pagination": {},
                "data": []
            };

            res.status(200).json(obj);
        }
    }
}

