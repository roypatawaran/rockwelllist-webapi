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
            var decodedToken = jwt.verify(req.body.token, 'GK8t;(2=<J*~/u%');
            var tracking_id = decodedToken._id;
            var _tenant = await Tenant.findById(req.sanitize(req.body.tenant_id));
            var _wallet = await Wallet.findById(decodedToken.wallet);
            var _wallet_payment = decodedToken._id;
    
            var walletAmount = await getWalletAmount(_wallet);
            var balance = walletAmount - amount;
    
            if(balance < 0)
            {
                _wallet_payment = await Payment.findByIdAndUpdate(_wallet_payment._id, {tenant: _tenant, amount: amount, tracking_id: tracking_id, transaction_date: new Date(), status: "UNSUCCESSFUL"});
                res.status(400).json({message: "Payment Error: Insufficient balance."});
            }
            else{
                _wallet_payment = await Payment.findByIdAndUpdate(_wallet_payment._id, {tenant: _tenant, amount: amount, tracking_id: tracking_id, transaction_date: new Date(), status: "SUCCESSFUL"});
    
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
                    if(payment.status == "SUCCESSFUL"){
                        var tenant = await Tenant.findById(payment.tenant[0]);
                        var status = {
                            _id: payment._id,
                            date_received: payment.transaction_date.getTime(),
                            date_updated: new Date().getTime(),
                            status: payment.status,
                            message: "You have used " + payment.amount + " PHP at " + tenant.name 
                        }
                        res.send(status);
                    }
                    else if(payment.status == "UNSUCCESSFUL"){
                        var status = {
                            _id: payment._id,
                            date_received: payment.transaction_date.getTime(),
                            date_updated: new Date().getTime(),
                            status: payment.status,
                            message: "Payment failed" 
                        }
                        res.status(400).send(status);
                    }
                    else{
                        var status = {
                            _id: payment._id,
                            date_received: payment.transaction_date.getTime(),
                            date_updated: payment.transaction_date.getTime(),
                            status: "PENDING",
                            message: "Payment request is still being verified."  
                        };
                        res.status(202).send(status);
                    }
                }
                else if(claims){
                    if(claims.status == "SUCCESSFUL"){
                        var status = {
                            _id: claims._id,
                            date_received: claims.transaction_date.getTime(),
                            date_updated: claims.transaction_date.getTime(),
                            status: claims.status,
                            message: "You have added " + claims.amount + " PHP to your wallet."  
                        }
                        res.send(status);
                    }
                    else if(claims.status == "UNSUCCESSFUL"){
                        var status = {
                            _id: claims._id,
                            date_received: claims.transaction_date.getTime(),
                            date_updated: claims.transaction_date.getTime(),
                            status: claims.status,
                            message: "Failed adding " + claims.amount + " PHP to your wallet"  
                        }
                        res.status(400).send(status);
                    }
                    else{
                        var status = {
                            _id: claims._id,
                            date_received: claims.transaction_date.getTime(),
                            date_updated: claims.transaction_date.getTime(),
                            status: "PENDING",
                            message: "Payment request is still being verified."  
                        };
                        res.status(202).send(status);
                    }
                }
    
            }
            else{
                res.status(404).send({message: "Error: No payment details found."})
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
        if(element.amount != undefined)
            totalPayment += element.amount;
    });

    totalAmount = totalClaims - totalPayment;

    return totalAmount;
}
