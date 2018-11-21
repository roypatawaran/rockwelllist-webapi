var express = require("express");
const itemsController = require("../controllers/items");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');
var checkAppVersion = require('../middleware/check-app-version');

var router = express.Router();
var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.get("/", middleware, itemsController.getAll)
      .post("/" ,middleware, itemsController.addItems)
      .put("/", middleware, itemsController.updateById)
      .delete("/", middleware, itemsController.deleteById);
router.get("/featured", middleware, itemsController.getByFeatured);
router.get("/:itemId", middleware, itemsController.getById);


module.exports = router;