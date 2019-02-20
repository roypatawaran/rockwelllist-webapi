
var mongoose = require('mongoose');
var jsonxml = require('jsontoxml');
var crypto = require('crypto');
var mkey = "8B56142A58367DEB7DBB630F6C8EA359";
var request = require('request');
var configs = require("../utils/configs");
var Disbursement = require("../models/disbursement");
const nodemailer = require('nodemailer');
var auth = require('../controllers/authentication');
var parseString = require('xml2js').parseString;

module.exports = {
    paynamics_disburse: async(req, res, next) => {
        var request_id = req.body.request_id;
        var payload = {
                "merchantid": "00000155839729554638",
                "merchant_ip": "127.0.0.1",
                "request_id": request_id,
                "notification_url": "https://rockwell-mobile.herokuapp.com/v1/finance/emailNotif" + request_id,
                "response_url": "https://rockwell-mobile.herokuapp.com/v1/finance/emailNotif" + request_id,
                "disbursement_info": "sample test",
                "disbursement_type": "0",
                "disbursement_date": "",
                "total_amount": "1.00",
                "total_amount_currency": "PHP",
                "signature": "0b27e3bfa5b83bca4a9c5fddef65338db00829cd63f87766deaac416f6d7e61e9e4cb631fe322fb04705fc2f978c275629f8d51e1a40b69215ec1d8992718436",
                "timestamp": "0001-01-01T00:00:00",
                "disbursement_items": {
                    "disbursement_details": {
                        "disbursement_data": [
                            {
                                "item": "request_id",
                                "value": request_id
                            },
                            {
                                "item": "sender_id",
                                "value": "ABC Company"
                            },
                            {
                                "item": "sender_fname",
                                "value": "Paynamics"
                            },
                            {
                                "item": "sender_lname",
                                "value": "Disbursement"
                            },
                            {
                                "item": "sender_mname",
                                "value": "P"
                            },
                            {
                                "item": "sender_address1",
                                "value": "Unit 1108 Cityland 10 Tower 2"
                            },
                            {
                                "item": "sender_address2",
                                "value": "H.V Dela Costa St."
                            },
                            {
                                "item": "sender_city",
                                "value": "Makati"
                            },
                            {
                                "item": "sender_state",
                                "value": "NCR"
                            },
                            {
                                "item": "sender_country",
                                "value": "PH"
                            },
                            {
                                "item": "sender_zip",
                                "value": "1227"
                            },
                            {
                                "item": "sender_email",
                                "value": "technical@paynamics.net"
                            },
                            {
                                "item": "sender_phone",
                                "value": "18008958899"
                            },
                            {
                                "item": "reason_for_transfer",
                                "value": "TEST"
                            },
                            {
                                "item": "fund_source",
                                "value": "CASH_OTC_BRNCH"
                            },
                            {
                                "item": "ben_fname",
                                "value": "Paynamics"
                            },
                            {
                                "item": "ben_mname",
                                "value": "P"
                            },
                            {
                                "item": "ben_lname",
                                "value": "Test"
                            },
                            {
                                "item": "ben_address1",
                                "value": "Unit 1108 Cityland 10 Tower 2"
                            },
                            {
                                "item": "ben_address2",
                                "value": "H.V Dela Costa St."
                            },
                            {
                                "item": "ben_city",
                                "value": "Makati"
                            },
                            {
                                "item": "ben_state",
                                "value": "NCR"
                            },
                            {
                                "item": "ben_country",
                                "value": "PH"
                            },
                            {
                                "item": "ben_zip",
                                "value": "1227"
                            },
                            {
                                "item": "ben_email",
                                "value": "technical@paynamics.net"
                            },
                            {
                                "item": "ben_phone",
                                "value": "639178854510"
                            },
                            {
                                "item": "disbursement_amount",
                                "value": "1.00"
                            },
                            {
                                "item": "currency",
                                "value": "PHP"
                            },
                            {
                                "item": "disbursement_method",
                                "value": "BNINSTAPAY"
                            },
                            {
                                "item": "signature",
                                "value": "c22a59291a7b9d2e2dba8cdc246ea556ab96c68dfb98a83005b14ce952c8af9b98d4f3199c13002586f1fcc35615d48a486b199b02f63b147698693047b95281"
                            },
                            {
                                "item": "bn_bank_code",
                                "value": "SEC"
                            },
                            {
                                "item": "bank_account_no",
                                "value": "1234567890123"
                            },
                            {
                                "item": "disbursement_info",
                                "value": "Remit Slip July 30 2014"
                            },
                            {
                                "item": "dob",
                                "value": "1990-01-28"
                            },
                            {
                                "item": "birthplace",
                                "value": "Malabon"
                            },
                            {
                                "item": "sender_nature_of_work",
                                "value": "Developer"
                            },
                            {
                                "item": "sender_nationality",
                                "value": "Filipino"
                            },
                            {
                                "item": "primary_kyc_doc",
                                "value": "IDP_001"
                            },
                            {
                                "item": "primary_kyc_id",
                                "value": "123421"
                            },
                            {
                                "item": "secondary_kyc_doc1",
                                "value": ""
                            },
                            {
                                "item": "secondary_kyc_id1",
                                "value": ""
                            },
                            {
                                "item": "secondary_kyc_doc2",
                                "value": ""
                            },
                            {
                                "item": "secondary_kyc_id2",
                                "value": ""
                            },
                            {
                                "item": "primary_kyc_expiry",
                                "value": "1990-01-28"
                            },
                            {
                                "item": "secondary_kyc_expiry1",
                                "value": ""
                            },
                            {
                                "item": "secondary_kyc_expiry2",
                                "value": ""
                            },
                            {
                                "item": "instapay_bank_code",
                                "value": "SEC"
                            }
                        ]
                    }
                }
        };

        var signatureHeader = setSignatureDisbursementHeader(payload);
        var signatureItems = setSignatureDisbursementItems(signatureHeader);
        var xml = setXML(signatureItems);

        var body = await makeDisbursement(xml, request_id);
        res.send(body);
    },
    emailNotification: async (req, res, next) => {
        console.log(req.params);
        console.log(req.params.request_id);
        email = "vincent.maceda@devboxph.com";
        nodemailer.createTestAccount((err, account) => {
            var transporter = nodemailer.createTransport({
                host: 'smtp.office365.com', // Office 365 server
                port: 587,     // secure SMTP
                secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            var subj = "Disbursement Successful";
            var inlineHtml = "<h3>Disbursement successful for Sample Tenant.</h3><&nbsp;<h4>Total Amount: ₱50.00</h4>";

            // setup email data with unicode symbols
            let mailOptions = {
                from: 'vincent.maceda@devboxph.com', // sender address
                to: email, // list of receivers
                subject: subj, // Subject line
                text: 'Hello world?', // plain text body
                html: inlineHtml // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(info);
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));


            });
        });
    }
}

function setXML(signatureHeader){
    var js2xmlparser = require("js2xmlparser");

    var xml = jsonxml(signatureHeader);
    var xml2 = js2xmlparser.parse('header_request', signatureHeader);

    return xml2;
}
    
function setSignatureDisbursementHeader(payload){
    var header_request = payload;
    var forSign = header_request.merchantid + header_request.request_id + header_request.merchant_ip + header_request.total_amount 
                  + header_request.notification_url + header_request.response_url + header_request.disbursement_info + header_request.disbursement_type + header_request.disbursement_date + mkey;


    var sha = crypto.createHash('sha512').update(forSign);
    var result = sha.digest('hex');
    payload.signature = result;

    return payload;
}

function setSignatureDisbursementItems(payload){
    var header_request = payload;
    var disbursement_items = payload.disbursement_items.disbursement_details.disbursement_data;
    var forSign = header_request.request_id + disbursement_items[2].value + disbursement_items[3].value + disbursement_items[4].value + disbursement_items[5].value
                + disbursement_items[6].value + disbursement_items[12].value + disbursement_items[26].value + disbursement_items[27].value + disbursement_items[28].value 
                + disbursement_items[31].value + disbursement_items[14].value + disbursement_items[13].value + disbursement_items[32].value + mkey;


    var sha = crypto.createHash('sha512').update(forSign);
    var result = sha.digest('hex');
    payload.disbursement_items.disbursement_details.disbursement_data[29].value = result;

    return payload;
}

async function makeDisbursement(payload, request_id){
    return new Promise(function(resolve, reject){
        request({method: 'POST', 
            headers: {'content-type' : 'text/xml'},
            uri: 'https://testpti.payserv.net/DisbursementGateTest/DisbursementImpl.svc/DisbursementServiceV2',
            body: payload}, function(error, resp, body){
                if(resp.statusCode == 200){
                    console.log('success');
                    var disbursement = new Disbursement({
                        xml: payload,
                        status: "PENDING",
                        request_id: request_id,
                        transaction_date: new Date()
                    });
                    Disbursement.create(disbursement);
                    resolve(body);
                  } else {
                    console.log('error: '+ resp.statusCode)
                    console.log(body)
                    reject(body);
                  }
            });
    })
}

generateEmail = function(email, hash){
    
}
