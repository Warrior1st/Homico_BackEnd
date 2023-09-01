var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var propertiesRouter = require("./routes/properties");
var dashboardRouter = require("./routes/dashboard.js");
var usersRouter = require("./routes/users");
var loginRouter = require("./routes/login");
var registerRouter = require("./routes/register");
var adminLoginRouter = require("./routes/adminLogin");
var adminPropertyRouter = require("./routes/adminProperty");

const session = require("express-session");

var app = express();

//Setting session variables
app.use(
  session({
    secret: "oeriughoeiu3894934h3uiprg3n312e@!#!@$#%#kdfjlbnls",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 12 * 60 * 60 * 1000 }, // 12 hours in milliseconds
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/auth/login", loginRouter);
app.use("/api/v1/auth/register", registerRouter);
app.use("/api/v1/properties", propertiesRouter);
app.use("/login", adminLoginRouter);
app.use("/property", adminPropertyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
