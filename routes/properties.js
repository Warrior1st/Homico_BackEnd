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
        query = `DELETE FROM Likes WHERE propertyId = ${propertyId} AND id = ${userId};`;
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

router.post("/search", async (req, res, next) => {
  const {
    address,
    bathRoomCounts,
    bedRoomCounts,
    cities,
    kitchenRoomCounts,
    maxPrice,
    maxSize,
    minPrice,
    minSize,
    parkingCounts,
    propertyCategories,
    propertyTypes,
    searchText,
  } = req.body;
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
    const pool = await sql.connect(config);

    const address = ""; // Provide the desired address pattern
    const bathroomCount = bathRoomCounts[0];
    const bedroomCount = bedRoomCounts[0];
    const cities = ""; // Provide the desired city name pattern
    const kitchenRoomCount = kitchenRoomCounts[0];
    const maxPricee = maxPrice;
    const maxSizee = maxSize;
    const minPricee = minPrice;
    const minSizee = minSize;
    const parkingCountse = parkingCounts[0];
    const propertyTypese = ""; // Provide the desired property type pattern
    const searchTexte = searchText; // Provide the desired search text pattern

    let query;

    if (userId) {
      query = `
    SELECT
        property.*,
        city.*,
        PropertyType.*,
        CASE WHEN Likes.propertyId IS NOT NULL THEN 1 ELSE 0 END AS is_liked
    FROM
        property
    JOIN
        city ON property.cityId = city.cityId
    JOIN
        PropertyType ON property.propertyTypeId = PropertyType.propertyTypeId
    LEFT JOIN
        Likes ON property.propertyId = Likes.propertyId AND Likes.id = @user
    WHERE
        property.addres LIKE '%' + @address + '%'
        AND property.baths > @bathroomCount
        AND property.beds > @bedroomCount
        AND city.nom LIKE '%' + @cities + '%'
        AND property.kitchens > @kitchenRoomCount
        AND property.price <= @maxPrice
        AND property.price >= @minPrice
        AND property.size <= @maxSize
        AND property.size >= @minSize
        AND property.parkings >= @parkingCounts
        AND PropertyType.nom LIKE '%' + @propertyTypes + '%'
        AND (property.title LIKE '%' + @searchText + '%' OR property.descr LIKE '%' + @searchText + '%')`;
    } else {
      query = `
    SELECT
        property.*,
        city.*,
        PropertyType.*,
        CASE WHEN Likes.propertyId IS NOT NULL THEN 1 ELSE 0 END AS is_liked
    FROM
        property
    JOIN
        city ON property.cityId = city.cityId
    JOIN
        PropertyType ON property.propertyTypeId = PropertyType.propertyTypeId
    WHERE
        property.addres LIKE '%' + @address + '%'
        AND property.baths > @bathroomCount
        AND property.beds > @bedroomCount
        AND city.nom LIKE '%' + @cities + '%'
        AND property.kitchens > @kitchenRoomCount
        AND property.price <= @maxPrice
        AND property.price >= @minPrice
        AND property.size <= @maxSize
        AND property.size >= @minSize
        AND property.parkings >= @parkingCounts
        AND PropertyType.nom LIKE '%' + @propertyTypes + '%'
        AND (property.title LIKE '%' + @searchText + '%' OR property.descr LIKE '%' + @searchText + '%')`;
    }

    const result = await pool
      .request()
      .input("user", sql.Int, userId)
      .input("address", sql.VarChar, address)
      .input("bathroomCount", sql.Int, bathroomCount)
      .input("bedroomCount", sql.Int, bedroomCount)
      .input("cities", sql.VarChar, cities)
      .input("kitchenRoomCount", sql.Int, kitchenRoomCount)
      .input("maxPrice", sql.Float, maxPricee)
      .input("maxSize", sql.Float, maxSizee)
      .input("minPrice", sql.Float, minPricee)
      .input("minSize", sql.Float, minSizee)
      .input("parkingCounts", sql.Int, parkingCountse)
      .input("propertyTypes", sql.VarChar, propertyTypese)
      .input("searchText", sql.VarChar, searchTexte)
      .query(query);
    const searchProperties = result.recordset; // Check if the user exists

    const response = searchProperties.map((property) => mapProperty(property));

    return res.json(response);
  }
});

function mapProperty(property) {
  // Map the property fields to your Property model
  return {
    // Map the fields accordingly
    // Example:
    id: property.propertyId,
    title: property.title,
    description: property.descr,
    city: "Kinshasa",
    imageNames: property.images,
    bedRoomCount: property.beds,
    bathRoomCount: property.baths,
    kitchenRoomCount: property.kitchens,
    parkingCount: property.parkings,
    price: property.price,
    address: property.addres,
    latitude: property.latitude,
    longitude: property.longitude,
    datePosted: property.datePosted,
    size: property.size,
    propertyType: property.nom,
    propertyCategory: property.saleType,
    user: property.name,
    agencyAddress: property.adress,
    agencyEmail: property.email,
    isLiked: property.is_liked,
  };
}

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
