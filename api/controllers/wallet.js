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
    redeem: async (req, res, next) => {
        try {
            var egc_id = req.params.egc_id;
            var egc = await Egc.findById(egc_id);
            var user = await getUser(req.headers.authorization);
            var wallet = await Wallet.find({user: user._id});
            if(egc){
                if(!egc.claimed){
                    //TODO validation for expiration
                    var claims = new Claims({
                        amount: egc.amount,
                        egc: egc,
                        transaction_date: new Date(),
                        wallet: wallet[0]
                    });

                    var _claims = await claims.save();
                    egc.claimed = true;
                    var _egc = await Egc.findByIdAndUpdate(egc_id, egc);

                    var respose = {
                        _id: _egc._id,
                        tracking_id: _egc.tracking_id,
                        credit_amount: _egc.amount
                    };

                    res.status(200).send(respose);
                }
                else{
                    res.send({message: "Error: Coupon already redeemed."});
                }
            }
            else{
                res.send({message: "Error: Coupon invalid."});
            }
        } catch(err) {
            next(err);
        }
    },
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
    createWallet: async (req, res, next) => {
        try{
            var accessCode = req.sanitize(req.headers.authorization);
            var token = jwt.verify(accessCode.replace("Bearer ", ""), "secret");
            //var _user = new User(token.data);
            var newWallet = new Wallet({
                user: token.data
            });

            var wallet = await newWallet.save();
            res.send(wallet);
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    getWallet: async (req, res, next) => {
        try{
            var user = await getUser(req.headers.authorization);
            var wallet = await Wallet.find({user: user._id});
            if(wallet.length == 0){
                var newWallet = new Wallet({
                    user: user
                });
    
                wallet = await newWallet.save();
            }

            var _wallet = Array.isArray(wallet) ? wallet[0] : wallet;
            var totalAmount = await getWalletAmount(_wallet);

            res.send({Amount: totalAmount});
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    getTransactionHistory: async (req, res, next) => {
        try{
            var limit = parseInt(req.query.limit);
            var name_like = req.query.name_like;
            var start_id = req.query.start_id;
            var user = await getUser(req.headers.authorization);
            var wallet = await Wallet.find({user: user._id});
            var claims = await Claims.find({wallet: wallet[0]._id}).populate('coupon');
            var payment = await Payment.find({wallet: wallet[0]._id}).populate('tenants');
            var transactions = [];

            for(var i = 0; i < claims.length; i++){
                var egc = await Egc.findById(claims[i].egc[0]);
                var trans = {
                    _id: claims[i]._id,
                    tracking_id: egc.tracking_id,
                    name: egc.name,
                    transaction_date: claims[i].transaction_date.getTime(),
                    credit_amount: claims[i].amount,
                    debit_amount: 0.00,
                };

                transactions.push(trans);
            }

            for(var x = 0; x < payment.length; x ++){
                var _tenant = await Tenant.findById(payment[x].tenant[0])
                var trans = {
                    _id: payment[x]._id,
                    tracking_id: payment[x].tracking_id,
                    name: _tenant.name,
                    transaction_date: payment[x].transaction_date.getTime(),
                    credit_amount: 0.00,
                    debit_amount: payment[x].amount,
                };
                transactions.push(trans);
            }

            transactions.sort(function(a,b){
                var date = new Date(a.transaction_date);
                var date2 = new Date(b.transaction_date);
                return date2 - date;
            })

            if(typeof start_id != "undefined" || !isNaN(limit)){
                var _transactions = pagination.chunkArray(transactions, limit);
                var transactions_index = pagination.getItemChunkIndex(_transactions, start_id);
                var next_id = pagination.getNextId(_transactions, transactions_index, transactions.length);
                var transaction_summary = limit != 0 ? _transactions[transactions_index] : _transactions;

                var resp = {
                    "pagination": {
                        "next": next_id
                    },
                    "data": transaction_summary
                };
                res.send(resp);
            }
            else{
                var resp = {
                    "pagination": {
                        "next": {}
                    },
                    "data": transactions
                };
                res.send(resp);
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    paymentToken: async (req, res, next) =>{
        try{
            var dateToday = new Date();
            var user = await getUser(req.headers.authorization);
            var wallet = await Wallet.find({user: user._id});
            var dateToday = new Date().getTime();
            var hash = crypto.createHash('md5').update(user._id + wallet._id).digest('hex');
            if(!wallet){
                res.send({message: "Wallet not found"});
            }
            var token = jwt.sign({
                wallet: crypto.createHash('md5').update(wallet[0]._id).digest('hex'),
                user: crypto.createHash('md5').update(user._id).digest('hex')
            }, hash);

            var paymentToken = new Coupon({
                qr_code: token,
                created_date: new Date(),
                expiration_date: dateToday.setMonth(dateToday.getMonth() + 2)
            });

            var _paymentToken = await paymentToken.save();

            var resp = {
                _id: _paymentToken._id,
                date_generated: _paymentToken.created_date.getTime(),
                expiration: _paymentToken.expiration_date.getTime(),
                token: _paymentToken.qr_code
            }

            res.send(resp);
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }
}

async function getUser (request) {
    var token = jwt.verify(request.replace("Bearer ", ""), "secret");
    var _user = await User.findById(token.data._id);

    return _user;
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
