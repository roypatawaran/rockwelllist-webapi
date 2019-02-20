var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var crypto = require("crypto");
var bcrypt = require("bcrypt");
// var cartProductSchema = require("../models/cartProduct.js");


var cmsUser = new mongoose.Schema({
	username: String,
	password: String,
	signupEmail: String,
	firstName: String,
	lastName: String,
	birthDate: Date,
	sex: String,
	mobileNumber: String,
	isValidated: String,
	accessCode: String,
    forgotPassword: String,
	role: String,
	tenantId: String
});

cmsUser.plugin(passportLocalMongoose, {usernameField: "username"});
module.exports = mongoose.model("cms_user", cmsUser);
