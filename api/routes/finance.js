var express = require("express");
var finaceController = require("../controllers/finance");

var router = express.Router();
//var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.post("/disburse", finaceController.paynamics_disburse);
router.get("/emailNotif", finaceController.emailNotification);

module.exports = router;