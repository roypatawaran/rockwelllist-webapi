var express = require("express");
var egcController = require("../controllers/egc");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');

var router = express.Router();

router.post("/", [checkAuth, checkApi.checkAPIKey], egcController.create_coupon);

module.exports = router;