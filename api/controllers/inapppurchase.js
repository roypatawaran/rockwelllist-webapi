var inAppPurchase = require('../models/inapppurchase');
var User = require('../models/user');
var Claims = require('../models/wallet_claims');
var Wallet = require('../models/wallet');
var mongoose = require('mongoose');
var response_msgs = require('../utils/response_msgs');
var uuidv4 = require('uuid/v4');
const jwt = require("jsonwebtoken");
var link = "http://127.0.0.1:3003/";
var request = require('request');
var querystring = require('querystring');

module.exports = {
    generateGUID: async (req, res, next) => {
        try{
            var user = await getUser(req.headers.authorization);
            var guid = uuidv4();
            var inApp = new inAppPurchase({
            status: "PENDING",
            user: user,
            guid: guid
            });
        
            var _inapp = await inAppPurchase.create(inApp)
            var obj = {
                token: guid.toString()
            }
            res.json(obj);
        }
        catch(err){
            next(err)
        }
    },
    successPurchase: async(req, res, next) => {
        try{
            var guid = req.params.token;
            var access_token = await getAccessToken();
            var payment_details = await getPaymentDetails(access_token, req.query.paymentId)
            if(payment_details.payer.status == "VERIFIED"){
                var inApp = await inAppPurchase.findOneAndUpdate({guid: guid},
                    {
                        transaction_date: new Date(),
                        payment_id: req.query.paymentId,
                        amount: payment_details.transactions[0].amount.total,
                        transaction_date: new Date(),
                        status: "SUCCESSFUL"
                    });
                console.log(inApp.user[0]);
                var claims = new Claims({
                    amount: payment_details.transactions[0].amount.total,
                    transaction_date: new Date(),
                    isSuccess: true,
                    apppurchase: inApp,
                    wallet : await Wallet.find({user: inApp.user[0]})
                });
                var _claims = await Claims.create(claims);
                res.send({message: "Payment Successful"});
            }
            else{
                res.status(404).send({message: "Payment not verified"})
            }

        }
        catch(err){
            console.log(err);
            next(err);
        }
    }
}

async function getAccessToken(){
    var client_id = "AVRhX3tWAuGCvUQWxjx6SROFd4Ha7WDPQeseLCGOt8nXofDGmMkmQGw7gxLGP7s1zyVEuqrMH7WwhG1b";
    var secret = "EEZpgGinVDah5XUI7xzqSndGRtPF3K3Aw4RkHExCadRAlmPDIKq44NrLLE04cMdoEKBwiERugHE6BB2E";
    var auth = 'Basic ' + Buffer.from(client_id + ':' + secret).toString('base64');
    var postData = querystring.stringify({
        grant_type: "client_credentials"
      });

    return new Promise(function(resolve, reject){
        request({method: 'POST', 
            headers: {'Authorization' : auth, 'Content-type':'application/x-www-form-urlencoded'},
            uri: 'https://api.sandbox.paypal.com/v1/oauth2/token',
            body: postData, json: true}, function(error, resp, body){
                if(resp.statusCode == 200){
                    resolve(resp.body.access_token);
                  } else {
                    console.log('error: '+ resp.statusCode)
                    console.log(body)
                    reject(body);
                  }
            });
    })
}

async function getPaymentDetails(access_token, payment_id){
    return new Promise(function(resolve, reject){
        request({method: 'Get', 
            headers: {'Authorization' : 'Bearer ' + access_token},
            uri: 'https://api.sandbox.paypal.com/v1/payments/payment/' + payment_id}, 
            function(error, resp, body){
                if(resp.statusCode == 200){
                    resolve(JSON.parse(resp.body));
                  } else {
                    console.log('error: '+ resp.statusCode)
                    console.log(body)
                    reject(body);
                  }
            });
    })
}


async function getUser (request) {
    var token = jwt.verify(request.replace("Bearer ", ""), "secret");
    var _user = await User.findById(token.data._id);

    return _user;
  }