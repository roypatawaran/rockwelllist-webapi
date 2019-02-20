var express = require("express");
const moviesController = require("../controllers/movies");
var checkAppVersion = require('../middleware/check-app-version');
var checkAuth = require('../middleware/check-auth');
var checkApi = require('../middleware/check-api');

var router = express.Router();
var middleware = [checkAuth, checkApi.checkAPIKey, checkAppVersion.checkVersion];

router.get("/", moviesController.getAll)
      .post("/", middleware, moviesController.addItems)
      .put("/", middleware, moviesController.updateById)
      .delete("/", middleware, moviesController.deleteById);
router.get("/featured", middleware, moviesController.getByFeatured);
router.get("/:movieId", middleware, moviesController.getById);

//CMS
router.get("/get/cms", moviesController.getMoviesCMS)
      .post("/", middleware, moviesController.addItems)
      .put("/cms", moviesController.updateById)
      .delete("/", middleware, moviesController.deleteById);
router.get("/get/cms/:movie_id", moviesController.getMovieDetailsCMS);

module.exports = router;