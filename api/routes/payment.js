var express = require("express");
var paymentController = require("../controllers/payment");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');

var router = express.Router();

router.post("/", [checkAuth, checkApi.checkAPIKey], paymentController.payment);
router.get("/:token_id", [checkAuth, checkApi.checkAPIKey], paymentController.payment_status);
module.exports = router;