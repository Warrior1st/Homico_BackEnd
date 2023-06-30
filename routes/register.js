var express = require("express");
var router = express.Router();
const sql = require("mssql");

// router.get("/", function (req, res, next) {
//   res.render("register", { title: "Cooking" });
// });

/* GET users listing. */
router.post("/", async (req, res, next) => {
  const { firstName, lastName, email, username, password } = req.body;
  const userRole = 2;

  const config = {
    user: "homico_admin",
    password: "Nejamaistrahir1997",
    server: "homicoserver.database.windows.net",
    database: "homico",
    options: {
      encrypt: true,
    },
  };

  try {
    await sql.connect(config);

    // Insert new user in the database
    await sql.query`insert into users(firstName, lastName, email, userName, passwrd, roleId) values (${firstName}, ${lastName}, ${email}, ${username}, ${password}, ${userRole})`;

    return res.sendStatus(204);
  } catch (error) {
    console.error("Database query error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during the database query" });
  } finally {
    sql.close();
  }
});

module.exports = router;
