var express = require("express");
var router = express.Router();
const sql = require("mssql");

const config = {
  user: "homico_admin",
  password: "Nejamaistrahir1997",
  server: "homicoserver.database.windows.net",
  database: "homico",
  options: {
    encrypt: true,
  },
};

router.get("/", function (req, res, next) {
  if (req.session.loggedIn) {
    // User is logged in
    res.render("property", { title: "Property Management" });
  } else {
    // User is not logged in, redirect to login
    res.redirect("/login");
  }
});

module.exports = router;
