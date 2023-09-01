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

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login", { title: "Connectez vous" });
});
router.post("/users", async function (req, res, next) {
  const { username, password } = req.body.data.User;
  const remember_me = req.body.data.User.remember_me || false;

  // Now you can access the form data
  const pool = await sql.connect(config);

  // Retrieve user from the database based on the username
  const result = await pool
    .request()
    .input("userName", sql.VarChar, username)
    .input("password", sql.VarChar, password)
    .query(
      "SELECT * FROM users INNER JOIN role ON users.roleId = role.roleId WHERE userName = @userName AND passwrd = @password and role.nom = 'Admin'"
    );
  const user = result.recordset[0]; // Check if the user exists
  if (!user) {
    const errorMessage = "Authentication failed";
    const redirectUrl = `/login?error=${encodeURIComponent(errorMessage)}`;
    return res.redirect(redirectUrl);
  }

  // Compare the password with the stored password (plain text)
  if (password === user.passwrd) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.nom,
    };

    const userId = user.id;
    const username = user.username;
    const role = user.nom;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const dateofBirth = user.dateofBirth;
    const phoneNumber = user.phoneNumber;
    const email = user.email;
    const address = user.address;
    const latitude = user.latitude;
    const longitude = user.longitude;
    const imageName = user.profilePic;

    //Store the time the user logged in
    const connexionDatetime = new Date().toISOString();

    // Insert the login record into the HistoriqueConnexion table
    const insertQuery = `INSERT INTO HistoriqueConnexion (id, connexion_datetime) VALUES (@userId, @connexionDatetime)`;
    const insertResult = await pool
      .request()
      .input("userId", sql.Int, user.id)
      .input("connexionDatetime", sql.DateTime, connexionDatetime)
      .query(insertQuery);

    if (insertResult.rowsAffected[0] === 1) {
      console.log("Login record stored successfully");
    } else {
      console.error("Error storing login record");
    }

    // Your code to process the form data goes here

    // Respond to the client
    req.session.loggedIn = true;
    res.redirect("/");
  }
});
module.exports = router;
