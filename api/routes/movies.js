var express = require("express");
const moviesController = require("../controllers/movies");
var checkAuth = require('../middleware/check-auth');

var router = express.Router();
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');

router.get("/", [checkAuth, checkApi.checkAPIKey], moviesController.getAll)
      .post("/", [checkAuth, checkApi.checkAPIKey], moviesController.addItems)
      .put("/", [checkAuth, checkApi.checkAPIKey], moviesController.updateById)
      .delete("/", [checkAuth, checkApi.checkAPIKey], moviesController.deleteById);
router.get("/featured", [checkAuth, checkApi.checkAPIKey], moviesController.getByFeatured);
router.get("/:movieId", [checkAuth, checkApi.checkAPIKey], moviesController.getById);

module.exports = router;