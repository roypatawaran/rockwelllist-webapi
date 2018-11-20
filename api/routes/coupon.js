var express = require("express");
var egcController = require("../controllers/egc");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');

var router = express.Router();

router.post("/", egcController.create_coupon);
router.get("/transactions", egcController.load_transactions);
router.get("/:coupon_id", [checkAuth, checkApi.checkAPIKey], egcController.getCouponDetails);
router.post("/load", egcController.load_egc);

module.exports = router;