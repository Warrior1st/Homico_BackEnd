var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.loggedIn) {
    // User is logged in
    res.render("index", { title: "Express", enviro: process.env.dbconn });
  } else {
    // User is not logged in, redirect to login
    res.redirect("/login");
  }
});

module.exports = router;
