var express = require("express");
var walletController = require("../controllers/wallet");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');
var checkAppVersion = require('../middleware/check-app-version');

var router = express.Router();
var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.get("/", middleware, walletController.getWallet);
router.get("/transactions", middleware, walletController.getTransactionHistory);
router.post("/", middleware, walletController.redeem);
router.post("/payment", middleware, walletController.payment);
router.post("/payment_token", middleware, walletController.paymentToken);
module.exports = router;