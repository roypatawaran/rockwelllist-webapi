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
var response_msgs = require("../utils/response_msgs");


module.exports = {
    payment: async (req, res, next) => {
        try{
            var amount = parseFloat(req.sanitize(req.body.amount));
            var _tenant = await Tenant.findById(req.sanitize(req.body.tenant_id));

            var decodedToken = jwt.verify(req.body.token, 'secret');
            var _wallet = await Wallet.findById(decodedToken.wallet);
            var _wallet_payment = await Payment.findById(decodedToken._id);
            var tracking_id = decodedToken._id;

            if(amount < 0){
                return res.status(400).send(response_msgs.error_msgs.AmoungLessThanZero);
            }
    
            var walletAmount = await getWalletAmount(_wallet);
            var balance = walletAmount - amount;
    
            if(balance < 0)
            {
                _wallet_payment = await Payment.findByIdAndUpdate(_wallet_payment._id, {tenant: _tenant, amount: amount, tracking_id: tracking_id, transaction_date: new Date(), status: "UNSUCCESSFUL"});
                res.status(400).json(response_msgs.error_msgs.InsufficientWallet);
            }
            else{
                _wallet_payment = await Payment.findByIdAndUpdate(_wallet_payment._id, {tenant: _tenant, amount: amount, tracking_id: tracking_id, transaction_date: new Date(), status: "SUCCESSFUL"});
    
                res.status(200).json({
                    message: "Payment Successful.",
                    tracking_id: tracking_id
                })
            }
          }  
        catch(err){
            if(err.name == "TokenExpiredError"){
                return res.status(400).send(response_msgs.error_msgs.TokenExpire)
            }
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
                res.status(404).send(response_msgs.error_msgs.NotFound);
            }
        }
        catch(err){
            console.log(err);
            res.status(400).send(response_msgs.error_msgs.RequestCantBeProcessed);
        }
    },
    tenantClaims: async(req, res, next) => {
        try{
            var summary = [];
            var claims = await Payment.find({}).populate("tenant", "name", Tenant);
            var tenants = removeDups(claims);
            tenants.forEach(tenant => {
                var total = 0;
                claims.forEach(function(claim, i){
                    if(typeof claim.tenant != "undefined" && claim.tenant != null){
                        if(claim.tenant.length > 0){
                            if(claim.tenant[0].name == tenant && claim.status == "SUCCESSFUL"){
                                total += claim.amount;
                            }
                        }
                    }
                });
                var _summary = {
                    tenant: tenant,
                    totalAmount: total
                };
                summary.push(_summary);
            });
            res.send(summary);
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    tenantClaimDetails: async(req, res, next) =>{
        try{
            var tenant = req.params.tenant;
            var claims = await Payment.find({}).populate("tenant", "name", Tenant);
            var tenantDrillDown = [];
            var counter = 0;

            claims.forEach(function(claim, i){
                counter++;
                if(typeof claim.tenant != "undefined" && claim.tenant != null){
                    if(claim.tenant.length > 0){
                        if(claim.tenant[0].name == tenant && claim.status == "SUCCESSFUL"){
                           tenantDrillDown.push(claim);
                        }
                    }
                }
            });

            console.log(counter);
            res.send(tenantDrillDown);
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
        if(element.amount != undefined && element.status != "PENDING" && element.status != "UNSUCCESSFUL")
            totalPayment += element.amount;
    });

    totalAmount = totalClaims - totalPayment;

    return totalAmount;
}

function removeDups(names) {
    try{
        let unique = {};
        names.forEach(function(i, index) {
            if(typeof i.tenant != "undefined" && i.tenant != null){
                if(i.tenant.length > 0){
                    if(!unique[i.tenant[0].name]) {
                        unique[i.tenant[0].name] = true;
                    }
                }
            }
        });
        return Object.keys(unique);
    }
    catch(err){
        console.log(err);
    }
  }