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
                    res.status(404).send({message: "Error: Coupon already redeemed."});
                }
            }
            else{
                res.status(404).send({message: "Error: Coupon invalid."});
            }
        } catch(err) {
            next(err);
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
            var x = process.env.Email;
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
                    if(payment[x].amount != undefined){
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
            // var hash = crypto.createHash('md5').update(user._id + wallet._id).digest('hex');
            if(!wallet){
                res.send({message: "Wallet not found"});
            }

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
            }, 'GK8t;(2=<J*~/u%', {expiresIn: '7m'});

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
            console.log(resp);
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
        if(element.amount != undefined)
            totalPayment += element.amount;
    });

    totalAmount = totalClaims - totalPayment;

    return totalAmount;
}
