var express = require("express");

var db = require("../database.js");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("user", { title: "Cooking" });
});

module.exports = router;
