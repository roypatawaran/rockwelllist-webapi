var express = require("express");
var paymentController = require("../controllers/payment");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');
var checkAppVersion = require('../middleware/check-app-version');

var router = express.Router();
var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.post("/", paymentController.payment);
router.get("/:token_id", middleware, paymentController.payment_status);
module.exports = router;