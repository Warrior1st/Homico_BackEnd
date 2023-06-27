const express = require("express");
const jwt = require("jsonwebtoken");
const odbc = require("odbc");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("login", { title: "login Page" });
});
// POST login route
router.post("/", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Establish a connection to the database using the ODBC driver and connection string
    //const connectionString = process.env.dbconnection;
    const connectionString = process.env.dbconn;
    const connection = await odbc.connect(connectionString);

    // Retrieve user from the database based on the username
    const result = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = result[0];

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password with the stored password (plain text)
    if (password === user.passwrd) {
      const payload = { userId: user.id, username: user.username };

      // Sign the token with a secret key and set an expiration time
      const token = jwt.sign(payload, "your_secret_key", { expiresIn: "1h" });

      // Return the token as the response
      return res.json({ token });
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
