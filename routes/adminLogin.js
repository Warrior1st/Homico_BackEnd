var express = require("express");
var router = express.Router();
const sql = require("mssql");
const mysql = require("mysql2/promise");

const config = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "admin",
  database: "homico",
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login", { title: "Connectez vous" });
});
router.post("/users", async function (req, res, next) {
  const { username, password } = req.body.data.User;
  const remember_me = req.body.data.User.remember_me || false;

  // Now you can access the form data
  //const pool = await sql.connect(config);

  // async function connectToDatabase() {
  //   try {
  //     const pool = await mysql.createPool(config); // Create a connection pool
  //     console.log("Connected to the MySQL database!");
  //     return pool;
  //   } catch (error) {
  //     console.error("Error connecting to the MySQL database:", error.message);
  //   }
  // }

  // connectToDatabase();

  async function queryDatabase(username, password) {
    try {
      // Create a connection pool
      const pool = await mysql.createPool(config);

      // Query with parameterized placeholders (`?`)
      const query = `
        SELECT * 
        FROM users 
        INNER JOIN role 
        ON users.roleId = role.roleId 
        WHERE userName = ? AND passwrd = ? AND role.nom = 'Admin'
      `;

      // Execute the query
      const [rows] = await pool.execute(query, [username, password]);

      // Log the results
      console.log(rows);
      return rows;
    } catch (error) {
      console.error("Error querying the database:", error.message);
      throw error;
    }
  }

  // Retrieve user from the database based on the username
  // const result = await pool
  //   .request()
  //   .input("userName", sql.VarChar, username)
  //   .input("password", sql.VarChar, password)
  //   .query(
  //     "SELECT * FROM users INNER JOIN role ON users.roleId = role.roleId WHERE userName = @userName AND passwrd = @password and role.nom = 'Admin'"
  //   );
  // const user = result.recordset[0]; // Check if the user exists
  // if (!user) {
  //   const errorMessage = "Authentication failed";
  //   const redirectUrl = `/login?error=${encodeURIComponent(errorMessage)}`;
  //   return res.redirect(redirectUrl);
  // }

  // Compare the password with the stored password (plain text)
  if (password === queryDatabase(username, password)) {
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

    storeLoginRecord(user, req, res);

    // Insert the login record into the HistoriqueConnexion table
    //   const insertQuery = `INSERT INTO HistoriqueConnexion (id, connexion_datetime) VALUES (@userId, @connexionDatetime)`;
    //   const insertResult = await pool
    //     .request()
    //     .input("userId", sql.Int, user.id)
    //     .input("connexionDatetime", sql.DateTime, connexionDatetime)
    //     .query(insertQuery);

    //   if (insertResult.rowsAffected[0] === 1) {
    //     console.log("Login record stored successfully");
    //   } else {
    //     console.error("Error storing login record");
    //   }

    //   // Your code to process the form data goes here

    //   // Respond to the client
    //   req.session.loggedIn = true;
    //   res.redirect("/");
  }

  async function storeLoginRecord(user, req, res) {
    try {
      // Create a connection pool
      const pool = await mysql.createPool(config);

      // Get the current date and time in ISO format
      const connexionDatetime = new Date().toISOString();

      // Parameterized query for inserting login record
      const insertQuery = `
        INSERT INTO HistoriqueConnexion (id, connexion_datetime) 
        VALUES (?, ?)
      `;

      // Execute the query with parameterized values
      const [insertResult] = await pool.execute(insertQuery, [
        user.id,
        connexionDatetime,
      ]);

      // Check if the record was inserted successfully
      if (insertResult.affectedRows === 1) {
        console.log("Login record stored successfully");
      } else {
        console.error("Error storing login record");
      }

      // Process the form data (your custom logic here)
      // ...

      // Respond to the client
      req.session.loggedIn = true;
      res.redirect("/");
    } catch (error) {
      console.error("Error storing login record:", error.message);
      res.status(500).send("An error occurred");
    }
  }
});
module.exports = router;
