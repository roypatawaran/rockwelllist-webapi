var express = require("express");
var inAppPurchaseController = require("../controllers/inapppurchase");

var router = express.Router();
//var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.get("/guid", inAppPurchaseController.generateGUID);
router.get("/success/:token", inAppPurchaseController.successPurchase);

module.exports = router;