var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const sql = require("mssql");

let featuredProperties = [1, 2, 5, 8];
let city = [1];
let headerImages = ["12"];

/* GET dashboard. */
router.get("/", function (req, res, next) {
  // Get the JWT token from the request header
  const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is in the format "Bearer <token>"
  let role;
  if (token) {
    // Decrypt the token and check the role in the payload
    // Replace the decryption logic with your own implementation
    const decryptedToken = decryptToken(token);
    const userId = decryptedToken?.userId;
    role = decryptedToken?.role.toLowerCase();
  } else {
    role = "publicUser";
    let a = 2;
  }

  // Check if the role is "user"
  if (
    role &&
    (role.trim() === "user" ||
      role.trim() === "admin" ||
      role.trim() === "publicUser")
  ) {
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
    SELECT TOP 1000 [propertyId],[Property].[cityId],[title],[descr],[images],[beds],[baths],[kitchens],[parkings],[price],[addres],[Property].[latitude],[Property].[longitude],[datePosted],[size],[PropertyType].[nom],[saleType],[Agences].[name], [Agences].[adress], [Agences].[email]
    FROM [dbo].[Property] LEFT JOIN [PropertyType] ON [Property].[propertyTypeId] = [PropertyType].[propertyTypeId] LEFT JOIN [dbo].[Agences] ON [Property].[agenceId] = [Agences].[agenceId]
    WHERE propertyId IN (${featuredProperties.join(",")});

    SELECT TOP 1000 [propertyId],[cityId],[title],[descr],[images],[beds],[baths],[kitchens],[parkings],[price],[addres],[latitude],[longitude],[datePosted],[size],[PropertyType].[nom],[saleType],[agenceId]
    FROM [dbo].[Property] LEFT JOIN [PropertyType] ON [Property].[propertyTypeId] = [PropertyType].[propertyTypeId] WHERE datePosted >= DATEADD(DAY, -30, GETDATE()) AND propertyId = 1;

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
    return res.status(403).json({ error: "Access denied." });
  }
});

// Helper function to map the property object
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
