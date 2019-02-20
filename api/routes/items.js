var express = require("express");
const itemsController = require("../controllers/items");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');
var checkAppVersion = require('../middleware/check-app-version');

var router = express.Router();
var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.get("/",  itemsController.getAll);
      
router.get("/featured", middleware, itemsController.getByFeatured);
router.get("/:itemId", middleware, itemsController.getById);

//CMS
router.get("/get/cms",  itemsController.geItemsCMS);
router.post("/" ,middleware, itemsController.addItems)
      .put("/cms", itemsController.updateById)
      .delete("/", middleware, itemsController.deleteById);
router.get("/get/cms/:tenant_id", itemsController.getTenantDetailsCMS);
router.get("/get/cms/name/:itemName", itemsController.getByName);

module.exports = router;