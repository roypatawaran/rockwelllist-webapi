var express = require("express");
var finaceController = require("../controllers/finance");

var router = express.Router();
//var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.post("/disburse", finaceController.paynamics_disburse);
router.post("/emailNotif/:request_id", finaceController.emailNotification);

module.exports = router;