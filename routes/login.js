const express = require("express");
const jwt = require("jsonwebtoken");
const odbc = require("odbc");
const router = express.Router();

const secret = "ejnjnbjenoiugh91eyr3r@~@3ijnwjekn";

// router.get("/", function (req, res, next) {
//   res.render("login", { title: "Cooking" });
// });

//POST login route
router.post("/", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Establish a connection to the database using the ODBC driver and connection string
    //const connectionString = process.env.dbconnection;
    const connectionString =
      "Driver={ODBC Driver 18 for SQL Server};Server=tcp:homicoserver.database.windows.net,1433;Database=homico;Uid=homico_admin;Pwd={Nejamaistrahir1997};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;";
    const connection = await odbc.connect(connectionString);

    // Retrieve user from the database based on the username
    const result = await connection.query(
      "select * from users, role where users.roleId = role.roleId and email = ?",
      [email]
    );
    const user = result[0];

    // Check if the user exists
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

      // Sign the token with a secret key and set an expiration time
      const token = jwt.sign(payload, secret, { expiresIn: "7d" });

      // Return the token as the response
      return res.json({
        token,
        userId,
        username,
        role,
        firstName,
        lastName,
        dateofBirth,
        phoneNumber,
        email,
        address,
        latitude,
        longitude,
        imageName,
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
