var express = require("express");
var walletController = require("../controllers/wallet");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');

var router = express.Router();

router.get("/", [checkAuth, checkApi.checkAPIKey], walletController.getWallet);
router.get("/transactions", [checkAuth, checkApi.checkAPIKey], walletController.getTransactionHistory);
router.post("/", [checkAuth, checkApi.checkAPIKey], walletController.redeem);
router.post("/payment", [checkAuth, checkApi.checkAPIKey], walletController.payment);
router.post("/payment_token", [checkAuth, checkApi.checkAPIKey], walletController.paymentToken);
module.exports = router;