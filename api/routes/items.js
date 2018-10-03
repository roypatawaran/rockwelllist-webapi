var express = require("express");
const itemsController = require("../controllers/items");
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');

var router = express.Router();

router.get("/", [checkAuth, checkApi.checkAPIKey], itemsController.getAll)
      .post("/" ,[checkAuth, checkApi.checkAPIKey], itemsController.addItems)
      .put("/", [checkAuth, checkApi.checkAPIKey], itemsController.updateById)
      .delete("/", [checkAuth, checkApi.checkAPIKey], itemsController.deleteById);
router.get("/featured", [checkAuth, checkApi.checkAPIKey], itemsController.getByFeatured);
router.get("/:itemId", [checkAuth, checkApi.checkAPIKey], itemsController.getById);


module.exports = router;