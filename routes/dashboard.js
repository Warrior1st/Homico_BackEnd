var express = require("express");
var router = express.Router();
const sql = require("mssql");

let featuredProperties = [1, 3, 5];
let city = [1];
let headerImages = ["12", "13"];

/* GET dashboard. */
router.get("/", function (req, res, next) {
  // Get the JWT token from the request header
  const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is in the format "Bearer <token>"

  // Decrypt the token and check the role in the payload
  // Replace the decryption logic with your own implementation
  //const decryptedToken = decryptToken(token);
  //const role = decryptedToken?.role;

  const role = "user";
  // Check if the role is "user"
  if (role === "user") {
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
    const query = `
      SELECT * FROM Property WHERE propertyId IN (${featuredProperties.join(
        ","
      )});
      SELECT * FROM Property WHERE datePosted >= DATEADD(DAY, -7, GETDATE());

      SELECT * FROM City WHERE cityId IN (${city.join(",")});
    `;

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
        const [featuredProperties, newProperties, city] = result.recordsets;

        // Build the dashboard model
        const dashboardModel = {
          headerImages: headerImages,
          featuredProperties: featuredProperties.map((property) =>
            mapProperty(property)
          ),
          topSearchCities: city.map((city) => mapCities(city)),
          newProperties: newProperties.map((property) => mapProperty(property)),
        };

        // Respond with the dashboard model
        res.json(dashboardModel);
      });
    });
  } else {
    // If the role is not "user", respond with an error
    res.status(403).json({ error: "Access denied." });
  }
});

// Helper function to map the property object
function mapProperty(property) {
  // Map the property fields to your Property model
  return {
    // Map the fields accordingly
    // Example:
    id: property.id,
    title: property.title,
    description: property.descr,
    images: property.images,
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
    propertyType: property.propertyTypeId,
    propertyCategory: property.saleType,
    agency: property.agenceId,
  };
}

function mapCities(city) {
  return {
    id: city.cityId,
    name: city.nom,
    imageName: city.images,
    searchCount: city.searchCount,
  };
}

// Helper function to decrypt the token
// Replace this function with your own implementation
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
