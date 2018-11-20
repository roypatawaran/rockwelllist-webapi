var express = require("express");
var egcController = require("../controllers/egc");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');
var checkAppVersion = require('../middleware/check-app-version');

var router = express.Router();
//var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];
var middleware = [checkAuth, checkApi.checkAPIKey];

router.post("/", egcController.create_coupon);
router.get("/transactions", egcController.load_transactions);
router.get("/:coupon_id", middleware, egcController.getCouponDetails);
router.post("/load", egcController.load_egc);

module.exports = router;