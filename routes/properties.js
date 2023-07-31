var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const sql = require("mssql");

router.get("/likes", function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  // Decrypt the token and check the role in the payload
  // Replace the decryption logic with your own implementation
  const decryptedToken = decryptToken(token);
  const userId = decryptedToken?.userId;
  const role = decryptedToken?.role.toLowerCase();

  role.trim();
  if (role === "user" || role === "admin") {
    // If the role is "user", proceed with fetching the dashboard data
    const config = {
      user: "homico_admin",
      password: "Nejamaistrahir1997",
      server: "homicoserver.database.windows.net",
      database: "homico",
      options: {
        encrypt: true,
      },
    };

    // Fetch the data for the dashboard
    // Modify the SQL query to retrieve the required data for the dashboard

    const parsedUserId = parseInt(userId, 10);
    const query = `SELECT TOP 1000 [propertyId] FROM Likes WHERE id=${parsedUserId};`;

    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return;
      }

      const request = new sql.Request();
      request.query(query, function (err, result) {
        if (err) {
          console.log(err);
          return;
        }

        // Extract the data from the SQL result
        const [likedProperties] = result.recordset;

        // Respond with the dashboard model
        res.json(likedProperties);
      });
    });
  } else {
    // If the role is not "user", respond with an error
    res.status(403).json({ error: "Access denied." });
  }
});
router.post("/like", async (req, res, next) => {
  const { propertyId, isLiked } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  // Decrypt the token and check the role in the payload
  // Replace the decryption logic with your own implementation
  const decryptedToken = decryptToken(token);
  const userId = decryptedToken?.userId;
  const role = decryptedToken?.role.toLowerCase();

  role.trim();

  if (role === "user" || role === "admin") {
    // If the role is "user", proceed with fetching the dashboard data
    const config = {
      user: "homico_admin",
      password: "Nejamaistrahir1997",
      server: "homicoserver.database.windows.net",
      database: "homico",
      options: {
        encrypt: true,
      },
    };
    let query;
    if (propertyId) {
      if (isLiked) {
        query = `INSERT INTO Likes (id, propertyId) VALUES (${userId},${propertyId});`;
      } else {
        query = `DELETE FROM Likes WHERE propertyId = ${propertyId};`;
      }
      sql.connect(config, function (err) {
        if (err) {
          console.log(err);
          return;
        }

        const request = new sql.Request();
        request.query(query, function (err, result) {
          if (err) {
            console.log(err);
            return;
          }

          // Respond with the dashboard model
          return res.status(204).end();
        });
      });
    } else {
      return res.status(400).json({ error: "Bad Request: Missing property." });
    }
  } else {
    // If the role is not "user", respond with an error
    return res.status(403).json({ error: "Access denied." });
  }
});

function decryptToken(token) {
  try {
    // Decrypt the token using the secret
    const payload = jwt.verify(token, "ejnjnbjenoiugh91eyr3r@~@3ijnwjekn");
    return payload;
  } catch (error) {
    // If there's an error during decryption (e.g., invalid token or secret), return null or handle the error accordingly
    console.log("Token decryption failed:", error);
    return null;
  }
}
module.exports = router;
