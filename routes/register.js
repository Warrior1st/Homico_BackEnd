var express = require("express");
var router = express.Router();
const odbc = require("odbc");

// router.get("/", function (req, res, next) {
//   res.render("register", { title: "Cooking" });
// });

/* GET users listing. */
router.post("/", async (req, res, next) => {
  const { firstName, lastName, email, username, password } = req.body;
  const userRole = 2;

  try {
    // Establish a connection to the database using the ODBC driver and connection string
    //const connectionString = process.env.dbconnection;
    const connectionString =
      "Driver={ODBC Driver 18 for SQL Server};Server=tcp:homicoserver.database.windows.net,1433;Database=homico;Uid=homico_admin;Pwd={Nejamaistrahir1997};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;";
    const connection = await odbc.connect(connectionString);

    //Insert new user in the database
    await connection.query(
      "insert into users(firstName, lastName, email, userName, passwrd, roleId) values (?,?,?,?,?,?)",
      [firstName, lastName, email, username, password, userRole]
    );

    return res.sendStatus(204);
  } catch (error) {
    console.error("Database query error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during the database query" });
  }
});

module.exports = router;
