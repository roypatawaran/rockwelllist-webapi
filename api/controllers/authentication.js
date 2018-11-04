var express = require("express");
var moment = require("moment");
var router = express.Router();
// var neword = require("../models/orders.js");
var user = require("../models/user.js");
var passport = require("passport");
var crypto = require("crypto");
var api = require("../models/api");
var authController = require("../controllers/authentication.js");
const nodemailer = require('nodemailer');
var moment = require('moment');
const jwt = require("jsonwebtoken");
var _jwt = require('../configs/jwt');

module.exports = {
    getUserList: async (req, res, next) => {
        try{
            var objectThrow = {
                page:{
                    userId: String,
                    page: String,
                    next: String
                },
                data: []
            }

            objectThrow.page.userId = req.sanitize(req.query.userId);
            objectThrow.page.page = req.sanitize(req.query.paginate);
            if(typeof req.query.paginate == 'undefined'){
                objectThrow.page.page = 10;
            }
            if(typeof req.query.userId == 'undefined'){
                objectThrow.page.userId = "";
            }
            console.log(objectThrow.page.userId);
            console.log(objectThrow.page.page);
            console.log(typeof(req.query.userId));

            var newArray = [];
            var users = await user.find({});
            var totalCount = users.length - 1;
            var next = 0;
            for(var x = 0; x <= totalCount; x ++)
            {
                if(req.query.userId == ''){
                    for(var y=totalCount; y>=(totalCount-objectThrow.page.page); y--){
                        console.log(y)
                        newArray.push(users[y]);
                    }
                    next = totalCount - (parseInt(objectThrow.page.page));
                    objectThrow.page.next = next;
                    objectThrow.data.push(newArray);
                    res.send(objectThrow);
                    break;
                }
                else{
                    if(users[x]._id == objectThrow.page.userId){
                        console.log(users[x]);
                        var paginateOffset = 0;
                        for(var y=0; y<parseInt(objectThrow.page.page); y++){
                            paginateOffset = x-y;
                            console.log(paginateOffset);
                            if(paginateOffset>=0){
                                newArray.push(users[paginateOffset]);
                                next = parseInt(paginateOffset)-1;
                            }  
                            else{
                                next = 0;
                                break;
                            }
                        }
                        objectThrow.page.next = next;
                        objectThrow.data.push(newArray);
                        res.send(objectThrow);
                        break;
                    }
                }
            }
        }
        catch(error){
            console.log(error);
            next(error);
        }
    },
    userMe: async (req, res, next) => {
        try{
            var accessCode = req.headers.authorization;
            accessCode = accessCode.replace("Bearer ", "");
            var decodedToken = jwt.decode(accessCode);
            var _user = await user.findById(decodedToken.data._id);
            
            var tempThrow = {
                "username": _user.username,
                "first_name": _user.firstName,
                "last_name": _user.lastName,
                "sex": _user.sex,
                "mobile_number": _user.mobileNumber,
                "birthdate":  new Date(_user.birthDate).getTime()
            }

            console.log(tempThrow);
            res.send(tempThrow);
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    apiSeed: async (req, res, next) => {
        try{
            api.create({apiKey: "c4b0f6409c117cd17d3c7638541c2029d642d3c9e71c6343741db45765df2a2f"}, function(err,res){
                if (err){
                    console.log(err);
                } else{
                    console.log(res);
                }
            })
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    emailForgot: async (req, res, next) => {
        try{
            req.body.username = req.sanitize(req.body.username);
            var buffer = crypto.randomBytes(16);
            var resetToken = crypto.randomBytes(16).toString('hex');
            var usr = await user.findOneAndUpdate({username: req.body.username}, {forgotPassword: resetToken});

            if(usr === null){
                res.status(401);
                res.send("User does not exist");
            }
            else{
                generateEmail("passwordResetEmail", req.body.username, resetToken);
                return res.send({
                    "success": {
                        "message": "Password reset successful"
                    }
                });
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    forgotPassword: async (req, res, next) => {
        try{
            req.params.id = req.sanitize(req.params.id);
            req.body.password = "Test123";
            var usr = await user.findOne({forgotPassword: req.params.id});
            if(!usr){
                res.status(403);
                return res.send("Invalid Password Token");
            }
            else{
                usr.setPassword(req.body.password, function(err){
                    usr.forgotPassword = null;
                    usr.save(function(err){
                        req.logIn(usr, function(err){
                            return res.send("User Password has been Reset");
                        })
                    })
                })
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    signUp: async (req, res, next) => {
        try{
            req.query.username = "vincent.maceda@devboxph.com";
            var usr = await user.find({username: req.query.username});
            if(usr.length != 0){
                return res.send(usr);
            }
            else{
                res.status(403);
                return res.send("You are not authorized to view");   
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    userUpdate: async (req, res, next) => {
        try{
            console.log(req.headers.authorization)
            var accessCode = req.sanitize(req.headers.authorization);
            var token = jwt.verify(accessCode.replace("Bearer ", ""), "secret");

            if (typeof(token) === "undefined"){
                res.status(401);
                res.send("Unauthorized");
            }
            else{
                accessCode = accessCode.replace("Bearer ", "");
                var usr = await user.findById(token.data._id);
                if(usr){
                    var firstName = compareUserData(req.sanitize(req.body.first_name), usr.firstName);
                    var lastName = compareUserData(req.sanitize(req.body.last_name), usr.lastName);
                    var birthDate = compareUserData(req.sanitize(req.body.birthdate), usr.birthDate);
                    var sex = compareUserData(req.sanitize(req.body.sex), usr.sex);
                    var mobileNumber = compareUserData(req.sanitize(req.body.mobile_number), usr.mobileNumber);

                    if(sex != "m" && sex != "f")
                    {
                        res.status(400);
                        res.send("Invalid input for Sex");
                    }

                    var objectTemp = {
                        firstName: firstName,
                        lastName: lastName,
                        birthDate: birthDate,
                        sex: sex,
                        mobileNumber: mobileNumber
                    }

                    var _user = await user.findOneAndUpdate({_id: token.data._id}, objectTemp);
                    if(_user){
                        res.status(200);
                            var tempObject = {
                                username: req.body.username,
                                first_name: firstName,
                                last_name: lastName,
                                sex: sex,
                                mobile_number: mobileNumber,
                                birthdate: new Date(birthDate).getTime()
                            }
                            console.log(resp);
                            res.send(tempObject);
                    }
                }
                else
                {
                    res.status(403);
                    res.send("User not found");
                }
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    todayDate: async (req, res, next) => {
        try{
            var today = new Date();

            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            // var str = date.toString("yyyy-MM-DD");
            console.log(date);
            res.send(date);
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    emailRegistration: async (req, res, next) => {
        try{
            console.log(req.headers['x-api-key']);
            req.body.username = req.sanitize(req.body.username);
            req.body.password = req.sanitize(req.body.password);
            req.body.firstName = req.sanitize(req.body.firstName);
            req.body.lastName = req.sanitize(req.body.lastName);
            req.body.birthDate = req.sanitize(req.body.birthDate);
            req.body.sex = req.sanitize(req.body.sex);
            req.body.mobileNumber = req.sanitize(req.body.mobileNumber);
            
            var hash = "";
            var token = "";
            
            if(req.body.sex != "m" && req.body.sex != "f")
            { 
                res.status(400);
                res.json({message: "Invalid input for Sex"});
            }

            var usr = await user.find({username: req.body.username});
            if(usr.length == 0){
                token = crypto.randomBytes(16).toString('hex');
                hash = crypto.randomBytes(8).toString('hex');

                var newUser = new user({
                    username: req.body.username,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    birthDate: req.body.birthDate,
                    sex: req.body.sex,
                    mobileNumber: req.body.mobileNumber,
                    isValidated: hash,
                    accessCode: token
                });

                var _user = user.register(newUser, req.body.password);
                res.send({});
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    emailLogin: async (req, res, next) => {
        try{
            req.body.username = "vincent.maceda@devboxph.com";
            var usr = await user.findOne({username: req.body.username});
            console.log("VALID" + usr);

            if(usr.isValidated != "true"){
                res.status(401);
                res.send("User Not Yet Validated");
            }
            else{
                var status = await checkUserDetails(req.body.username);
                if(status){
                    is_new_user = false;
                }
                else{
                    is_new_user = true;
                }
                var relevantData = {
                    username: usr.username,
                    'access_token': usr.accessCode,
                    'is_new_user': is_new_user,
                    _id: usr._id
                };

                if (!is_new_user){
                    relevantData = {
                        username: usr.username,
                        'access_token': usr.accessCode,
                        'is_new_user': is_new_user,
                        "user" : {
                            "first_name": usr.firstName,
                            "last_name": usr.lastName,
                            "birthdate":  new Date(usr.birthDate).getTime(),
                            "sex": usr.sex,
                            "mobile_number": usr.mobileNumber
                        },
                        _id: usr._id
                    };
                }

                var token = jwt.sign({
                    data: relevantData
                }, _jwt.JWT_KEY);

                relevantData.access_token = token;
                
                console.log("-----------------------------------------")
                return res.send(relevantData);
            }
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    successSignin: async (req, res, next) => {
        console.log("in route")
        console.log(req.params.id)
        if (typeof req.params.id === 'undefined'){
            res.send("You are not authorized to access!");
        }
        else{
            var usr = await user.findOne({username: req.body.username});
            var status = checkUserDetails(req.user.username);
            console.log("Check Here" + status);
            if(status){
                is_new_user = false;
            }
            else{
                is_new_user = true;
            }
            var relevantData = {
                username: req.user.username,
                'access_token': req.user.accessCode,
                'is_new_user': is_new_user
            };
            if (!is_new_user){
                relevantData = {
                    username: req.user.username,
                    'access_token': req.user.accessCode,
                    'is_new_user': is_new_user,
                    "user" : {
                        "first_name": req.user.firstName,
                        "last_name": req.user.lastName,
                        "birthdate": req.user.birthDate,
                        "sex": req.user.sex,
                        "mobile_number": req.user.mobileNumber
                    }
                }
            }
            res.send(relevantData);
        }
    },
    activateUser: async (req, res, next) => {
        try{
            var usr = await user.findOneAndUpdate({isValidated: req.params.id}, {isValidated: 'true'});
            res.send(usr);
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    facebookDetails: async (req, res, next) => {
        try{
            var status = checkUserDetails(req.user.username);
             //place access token fix here
            console.log(status);
            if(status){
                is_new_user = false;
            }
            else{
                is_new_user = true;
            }
            var throwObject = {
                // "access_token": req.user.facebook.token,
                "access_token": req.user.accessCode,
                "is_new_user": is_new_user
            }
            res.send(throwObject);
        }
        catch(err){
            console.log(err);
            next(err);
        }
    },
    removeUser: async (req, res, next) => {
        try{
            req.body.username = req.sanitize(req.body.username);
            var usr = await user.deleteOne({username: req.body.username});
            res.send({message: req.body.username + " has been deleted"});
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }
}

compareUserData = function(request, user){
    if(typeof request !=  "undefined")
    {
        if(request != user)
            return request;
        else
            return user;
    }
    else
        return user;
}

function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.send(req.user);
}


generateEmail = function(type, email, hash){
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.Email, // generated ethereal user
                pass: process.env.Password // generated ethereal password
            }
        });
        var subj = "";
        var inlineHtml = "";
        switch(type){
            case "passwordResetEmail":
                subj = "Rockwell Password Reset Link";
                inlineHtml = '<a href='+ '"https://rockwell-mobile.herokuapp.com/forgotPassword/'+hash +'">Reset Password</a>';
                break;
            case "activationEmail":
                subj = "Rockwell User Activation Email";
                inlineHtml = '<a>https://rockwell-mobile.herokuapp.com/activate/'+hash +'</a>';
                break;
            default:
                subj = "Rockwell User Activation Email";
                inlineHtml = '<a href='+ '"https://rockwell-mobile.herokuapp.com/activate/'+hash +'">Activate Your Account Now!</a>';
                break;
        }
        var subject

        // setup email data with unicode symbols
        let mailOptions = {
            from: 'enzo.yu@devboxph.com', // sender address
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

checkUserDetails = async function(uname){
    var usr = await user.findOne({username: uname});
    console.log(usr);

    if(typeof(usr.firstName) == "undefined" || typeof(usr.lastName) == "undefined" || typeof(usr.sex) == "undefined" || typeof(usr.mobileNumber) == "undefined" || typeof(usr.birthDate) == "undefined"){
        return false;
    }
    else{
        return true;
    }
}