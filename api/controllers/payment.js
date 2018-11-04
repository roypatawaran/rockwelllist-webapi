var Egc = require('../models/egc');
var Claims = require('../models/wallet_claims');
var Wallet = require('../models/wallet');
var Payment = require('../models/wallet_payment');
var Tenant = require('../models/tenants');
var User = require('../models/user');
var pagination = require('../utils/pagination');
var mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
var crypto = require("crypto");

module.exports = {
    payment: async (req, res, next) => {
        try{
            var amount = parseFloat(req.sanitize(req.body.amount));
            var tracking_id = req.sanitize(req.body.tracking_id);
            var _tenant = await Tenant.findById(req.sanitize(req.body.tenant_id));
            var _wallet = await Wallet.findById(req.sanitize(req.body.wallet_id));

            var walletAmount = await getWalletAmount(_wallet);
            var balance = walletAmount - amount;

            if(balance < 0)
            {
                res.json({message: "Payment Error: Insufficient balance."});
            }
            else{
                var _payment = new Payment({
                    wallet: _wallet._id,
                    tenant: _tenant._id,
                    amount: amount,
                    tracking_id: tracking_id,
                    transaction_date: new Date(),
                    isSuccess: true
                });

                var payment = await _payment.save();

                res.status(200).json({
                    message: "Payment Successful."
                })
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    payment_status: async (req, res, next) => {
        try{
            var token_id = req.params.token_id;
            var payment = await Payment.findById(token_id);
            var claims = await Claims.findById(token_id);

            if(payment || claims){
                if(payment){
                    if(payment.isSuccess){
                        var status = {
                            _id: payment._id,
                            date_received: payment.transaction_date.getTime(),
                            date_updated: payment.transaction_date.getTime(),
                            isSuccess: payment.isSuccess,
                            message: "You have used" + payment.amount + " PHP at " + payment.tenant[0].name 
                        }
                        res.send(status);
                    }
                    else{
                        var status = {
                            _id: payment._id,
                            date_received: payment.transaction_date.getTime(),
                            date_updated: payment.transaction_date.getTime(),
                            isSuccess: payment.isSuccess,
                            message: "Payment request is still being verified."  
                        };
                        res.status(202).send(status);
                    }
                }
                else if(claims){
                    if(claims.isSuccess){
                        var status = {
                            _id: claims._id,
                            date_received: claims.transaction_date.getTime(),
                            date_updated: claims.transaction_date.getTime(),
                            isSuccess: claims.isSuccess,
                            message: "You have added " + claims.amount + " PHP to your wallet."  
                        }
                        res.send(status);
                    }
                    else{
                        var status = {
                            _id: claims._id,
                            date_received: claims.transaction_date.getTime(),
                            date_updated: claims.transaction_date.getTime(),
                            isSuccess: claims.isSuccess,
                            message: "Payment request is still being verified."  
                        };
                        res.status(202).send(status);
                    }
                }
    
            }
            else{
                res.send({message: "Error: No payment details found."})
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }
}

async function getWalletAmount(wallet){
    var claims = await Claims.find({wallet: wallet._id});
    var payment = await Payment.find({wallet: wallet._id});
    var totalClaims = 0, totalPayment = 0, totalAmount = 0;
    
    claims.forEach(element => {
        totalClaims += element.amount;
    });

    payment.forEach(element => {
        totalPayment += element.amount;
    });

    totalAmount = totalClaims - totalPayment;

    return totalAmount;
}
