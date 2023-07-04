const express = require("express");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const router = express.Router();

const secret = "ejnjnbjenoiugh91eyr3r@~@3ijnwjekn";

//POST login route
router.post("/", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Establish a connection to the database using the ODBC driver and connection string
    //const connectionString = process.env.dbconnection;
    const config = {
      user: "homico_admin",
      password: "Nejamaistrahir1997",
      server: "homicoserver.database.windows.net",
      database: "homico",
      options: {
        encrypt: true,
      },
    };

    const pool = await sql.connect(config);

    // Retrieve user from the database based on the username
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query(
        "SELECT * FROM users, role WHERE users.roleId = role.roleId AND email = @email"
      );
    const user = result.recordset[0]; // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
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

      // Sign the token with a secret key and set an expiration time
      const token = jwt.sign(payload, secret, { expiresIn: "7d" });

      // Return the token as the response
      return res.json({
        token,
        user,
      });
    } else {
      // Invalid password
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during the database query" });
  }
});

module.exports = router;
