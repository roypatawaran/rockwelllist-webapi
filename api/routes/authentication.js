var express = require("express");
var authsController = require("../controllers/authentication");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');
var checkAppVersion = require('../middleware/check-app-version');
var passport = require("passport");

var router = express.Router();

var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.get("/userList", middleware, authsController.getUserList);
router.get('/user/me', middleware, authsController.userMe);
router.get('/apiSeed', middleware, authsController.apiSeed);

//REST for Forgot Password
router.get("/forgotPassword", function(req,res){
    //Render screen to input username and embed post to forgot password
})
router.post('/auth/email/forgot', checkApi.checkAPIKey, authsController.emailForgot);
router.get("/forgotPassword/:id", function(req,res){
    req.params.id = req.sanitize(req.params.id);
    //RENDER Reset Password Screen and place Reset Token in POST Request
});
router.post("/forgotPassword/:id", checkApi.checkAPIKey, authsController.forgotPassword);

//REST for Signup
router.get("/backend_register", function(req,res){
    res.render("signUp.ejs");
});
router.get('/signup', middleware, authsController.signUp);

router.put('/user/update', middleware, authsController.userUpdate);
router.get('/todayDate', checkApi.checkAPIKey, authsController.todayDate);
router.post('/auth/email/registration', checkApi.checkAPIKey, authsController.emailRegistration);
router.post('/auth/email/login', checkApi.checkAPIKey, authsController.emailLogin);
router.get('/logout', checkApi.checkAPIKey, authsController.logout);
router.get('/successSignin/:id', checkApi.checkAPIKey, authsController.successSignin);
router.get('/activate/:id', authsController.activateUser);

//===============Facebook Authentication
router.get('/auth/social', passport.authenticate('facebook', {scope: ['email']}));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/facebookDetails',
                                      failureRedirect: '/login' }));

//CMS
router.post('/cms', authsController.add_cms_user);
router.post('/cms/login', authsController.login_cms);

module.exports = router;