var Egc = require('../models/egc');
var Claims = require('../models/wallet_claims');
var Wallet = require('../models/wallet');
var Payment = require('../models/wallet_payment');
var Tenant = require('../models/tenants');
var PaymentToken = require('../models/payment_token');
var User = require('../models/user');
var pagination = require('../utils/pagination');
var mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
var crypto = require("crypto");
var response_msgs = require("../utils/response_msgs");

module.exports = {
    redeem: async (req, res, next) => {
        try {
            var egc_id = req.body.egc_id;
            var egc = await Egc.find({tracking_id: egc_id});
            var user = await getUser(req.headers.authorization);
            var wallet = await Wallet.find({user: user._id});
            if(egc.length > 0){
                var egc = egc[0];
                if(!egc.claimed){
                    //TODO validation for expiration
                    var claims = new Claims({
                        amount: egc.amount,
                        egc: egc,
                        transaction_date: new Date(),
                        wallet: wallet[0]
                    });

                    var _claims = await claims.save();
                    egc.claimed = egc.tracking_id == "123456789" ? false : true;
                    var _egc = await Egc.findByIdAndUpdate(egc._id, egc);

                    var respose = {
                        _id: _egc._id,
                        tracking_id: _egc.tracking_id,
                        credit_amount: _egc.amount
                    };

                    res.status(200).send(respose);
                }
                else{
                    res.status(400).send(response_msgs.error_msgs.EGCClaimed);
                }
            }
            else{
                res.status(400).send(response_msgs.error_msgs.InvalidCoupon);
            }
        } catch(err) {
            res.status(400).send(response_msgs.error_msgs.RequestCantBeProcessed);
        }
    },
    payment: async (req, res, next) => {
      try{
        //var amount = parseFloat(req.sanitize(req.body.amount));
        // var tracking_id = req.sanitize(req.body.tracking_id);
        // var _tenant = await Tenant.findById(req.sanitize(req.body.tenant_id));
        // var _wallet = await Wallet.findById(req.sanitize(req.body.wallet_id));
        // var _wallet_payment = await Payment.findById(req.body._id);

        var amount = 100;
        var tracking_id = "Test tracking ID";
        var _tenant = await "5ba206fc3d20ff31503659fc";
        var _wallet = await "5bdd5251c4c8a22e44088e38";
        var _wallet_payment = "5be5695dc5a2792f50a9e81c";
        var walletAmount = await getWalletAmount(_wallet);
        var balance = walletAmount - amount;

        if(balance < 0)
        {
            res.json({message: "Payment Error: Insufficient balance."});
        }
        else{
            var _payment = await Payment.findByIdAndUpdate(_wallet_payment._id, {tenant: _tenant._id, amount: amount, tracking_id: tracking_id, transaction_date: new Date(), status: "successful"});

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

            res.send({balance: totalAmount});
        }
        catch(err){
            console.log(err);
            res.status(400).send(response_msgs.error_msgs.RequestCantBeProcessed);
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
                if(egc){
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
            }

            for(var x = 0; x < payment.length; x ++){
                    if(payment[x].amount != undefined){
                        var _tenant = await Tenant.findById(payment[x].tenant[0]);
                        if(_tenant){
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
                }
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

                // Empty Transactions Handler
                transaction_summary = transaction_summary.length == 0 ? [] : transaction_summary;

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
                    "pagination": {},
                    "data": transactions
                };
                res.send(resp);
            }
        }
        catch(err){
            console.log(err);
            var obj = {
                "pagination": {},
                "data": []
            };

            res.status(200).json(obj);
        }
    },
    paymentToken: async (req, res, next) =>{
        try{
            var dateToday = new Date();
            var user = await getUser(req.headers.authorization);
            var wallet = await Wallet.findOne({user: user._id});
            var resp = {}
            if(!wallet){
                res.status(404).send(response_msgs.error_msgs.WalletNotFound);
            }

            var payments = await Payment.find({wallet: wallet});
            var existingToken = await getExistingToken(payments);

            if(existingToken.length > 0){
                var wallet_payment = await Payment.findById(existingToken[0].wallet_payment);
                if(typeof wallet_payment.amount == "undefined"){
                    resp = {
                        _id: wallet_payment._id,
                        date_generated: existingToken[0].date_generated.getTime(),
                        date_expired: existingToken[0].date_expires.getTime(),
                        token: existingToken[0].qr_code
                    }
                }
                else{
                    resp = await generateNewPaymentToken(wallet, user);
                }
            }
            else{
                resp = await generateNewPaymentToken(wallet, user);
            }
            
            console.log(resp);
            res.send(resp);
        }
        catch(err){
            console.log(err);
            res.status(400).send(response_msgs.error_msgs.RequestCantBeProcessed);
        }
    }
}

async function getUser (request) {
    var token = jwt.verify(request.replace("Bearer ", ""), "secret");
    var _user = await User.findById(token.data._id);

    return _user;
  }

  async function getExistingToken(payments){
    var dateToday = new Date();
    var paymentTokens = [];  

    for(var i = 0; i < payments.length; i++){
        paymentTokens = await PaymentToken.find({wallet_payment: payments[i], date_expires: {$gte: dateToday}, date_generated: {$lte: dateToday}});
    }
    return paymentTokens;
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

async function generateNewPaymentToken(wallet, user){
    var dateToday = new Date();
    var wallet_payment = new Payment({
        wallet: wallet,
        status: "PENDING",
        transaction_date: new Date(),
    });

    var payment = await wallet_payment.save();

    var token = jwt.sign({
        wallet: wallet._id,
        _id: payment._id,
        user: user._id
    }, 'secret', {expiresIn: '7m'});

    var paymentToken = new PaymentToken({
        qr_code: token,
        date_generated: new Date().getTime(),
        date_expires: dateToday.setMinutes(dateToday.getMinutes() + 7),
        wallet_payment: payment
    });

    paymentToken = await paymentToken.save();

    var resp = {
        _id: payment._id,
        date_generated: paymentToken.date_generated.getTime(),
        date_expired: paymentToken.date_expires.getTime(),
        token: paymentToken.qr_code
    }

    return resp;
}
