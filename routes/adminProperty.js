var express = require("express");
var router = express.Router();
const sql = require("mssql");
const path = require("path");
const fs = require("fs");

const multer = require("multer");

const handleError = (err, res) => {
  res.status(500);
};

const config = {
  user: "homico_admin",
  password: "Nejamaistrahir1997",
  server: "homicoserver.database.windows.net",
  database: "homico",
  options: {
    encrypt: true,
  },
};

const upload = multer({
  dest: "/images",
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});
router.post("/mngmntPropertyType", function (req, res, next) {
  if (req.session.loggedIn) {
    const propId = req.body.propId;
    const query = `
  select [Property].[propertyId] as propertyId, [City].[nom] as city, [title], [descr], [Property].[images], [beds], [baths],
  [kitchens], [parkings], [price], [addres], [Property].[latitude], [Property].[longitude], [datePosted], [size], [saleType],
  [PropertyType].[nom] as propertyType, [Agences].[name] as agence
  from property 
  left join city on property.cityId = City.cityId
  left join PropertyType on Property.propertyTypeId = PropertyType.propertyTypeId
  left join Agences ON Property.agenceId = Agences.agenceId
  where [Property].[propertyId] = ${propId};
  
  select [propertyTypeId], [nom] from PropertyType;
  select [cityId], [nom] from City;
  select [agenceId], [name] from Agences;
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
        const [properties, propTypes, cities, agences] = result.recordsets;

        let adminPropMngmnt = {
          prop: properties,
          propType: propTypes,
          city: cities,
          agency: agences,
        };

        // Build the adminPropMngmnt model
        return res.json(adminPropMngmnt);
      });
    });
  } else {
    return res.status(403).json("Not authorized");
  }
});

router.get("/", function (req, res, next) {
  if (req.session.loggedIn) {
    // User is logged in
    if (Object.keys(req.query).length > 0) {
      // There are query parameters, execute the update query
      const {
        propertyId,
        nom,
        description,
        adresse,
        chambres,
        bains,
        cuisines,
        parkings,
        prix,
        latitude,
        longitude,
        taille,
        typeVente,
        typePropriete,
        ville,
        agence,
        images,
      } = req.query;

      // Construct and execute the update query here
      const updateQuery = `
        UPDATE Property SET title = ${nom},
        descr = ${description},
        addres = ${adresse},
        beds = ${chambres},
        baths = ${bains},
        kitchens = ${cuisines},
        parkings = ${parkings},
        price = ${prix},
        latitude = ${latitude},
        longitude = ${longitude},
        size = ${taille},
        saleType = ${typeVente},
        propertyTypeId = ${typePropriete},
        cityId = ${ville},
        agenceId = ${agence} WHERE propertyId = ${propertyId};
      `;

      sql.connect(config, function (err) {
        if (err) {
          console.log(err);
          return;
        }

        const request = new sql.Request();
        request.query(updateQuery, function (err, result) {
          if (err) {
            console.log(err);
            return;
          }

          // Handle the update result if needed

          // Now execute the select queries
          executeSelectQueries(req, res);
        });
      });
    } else {
      // No query parameters, execute the select queries directly
      executeSelectQueries(req, res);
    }
  } else {
    res.redirect("/login");
  }
});

router.post("/upload", upload.array("file", 5), function (req, res) {
  if (req.session.loggedIn) {
    //This is stuff todo tomorrow need to finish the update query as well as think about how we are going to rename the photos to match with their names in the database.
    //Also the testing is not complete
    const {
      propertyId,
      nom,
      description,
      adresse,
      chambres,
      bains,
      cuisines,
      parkings,
      prix,
      latitude,
      longitude,
      taille,
      typeVente,
      typePropriete,
      ville,
      agence,
      images,
    } = req.body;

    // Construct and execute the update query here
    const updateQuery = `
      UPDATE Property SET title = ${nom},
      descr = ${description},
      addres = ${adresse},
      beds = ${chambres},
      baths = ${bains},
      kitchens = ${cuisines},
      parkings = ${parkings},
      price = ${prix},
      latitude = ${latitude},
      longitude = ${longitude},
      size = ${taille},
      saleType = ${typeVente},
      propertyTypeId = ${typePropriete},
      cityId = ${ville},
      images = ${images},
      agenceId = ${agence} WHERE propertyId = ${propertyId};
    `;

    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return;
      }

      const request = new sql.Request();
      request.query(updateQuery, function (err, result) {
        if (err) {
          console.log(err);
          return;
        }

        // Handle the update result if needed
      });
    });

    if (req.files.length > 0) {
      req.files.forEach((file) => {
        const tempPath = file.path;
        const targetPath = path.join(
          __dirname,
          `../public/images/${file.originalname}`
        );

        if (path.extname(file.originalname).toLowerCase() === ".jpeg") {
          fs.rename(tempPath, targetPath, (err) => {
            if (err) return handleError(err, res);
          });
        } else {
          fs.unlink(tempPath, (err) => {
            if (err) return handleError(err, res);
          });
        }
      });

      res.status(200).contentType("text/plain").end("Files uploaded!");
    } else {
      res.status(400).contentType("text/plain").end("No files uploaded!");
    }
  } else {
    return res.status(403).json("Not authorized");
  }
});

function executeSelectQueries(req, res) {
  // Execute the select queries here
  const query = `
    select [Property].[propertyId] as propertyId, [City].[nom] as city, [title], [descr], [Property].[images] as images, [beds], [baths],
    [kitchens], [parkings], [price], [addres], [Property].[latitude], [Property].[longitude], [datePosted], [size], [saleType], [PropertyType].[nom] as propertyType, [Agences].[name] as agence
    FROM property
    LEFT JOIN city ON property.cityId = City.cityId
    LEFT JOIN PropertyType ON Property.propertyTypeId = PropertyType.propertyTypeId
    LEFT JOIN Agences ON Property.agenceId = Agences.agenceId;
    
    SELECT [cityId],[nom] FROM City;
    SELECT [propertyTypeId], [nom] FROM PropertyType;
    SELECT [agenceId], [name] FROM Agences;
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
      const [properties, cities, propertyTypes, agences] = result.recordsets;
      // Build the dashboard model

      const propertyDictionary = {};
      properties.forEach((property) => {
        propertyDictionary[property.propertyId] = property;
      });

      const citiesDictionary = {};
      cities.forEach((city) => {
        citiesDictionary[city.cityId] = city.nom;
      });

      const agencesDictionary = {};
      agences.forEach((agence) => {
        agencesDictionary[agence.agenceId] = agence.name;
      });

      res.render("property", {
        title: "Property Management",
        houses: propertyDictionary,
        cities: citiesDictionary,
        propertyTypes: propertyTypes,
        agences: agencesDictionary,
      });
    });
  });
}

// router.get("/", function (req, res, next) {
//   if (req.session.loggedIn) {
//     // User is logged in
//     //Retrieve the houses data from the database
//     //TODO: Absolutely need to implement paging for this

//     // Check if the role is "user"
//     // Fetch the data for the dashboard
//     // Modify the SQL query to retrieve the required data for the dashboard
//     const query = `
//     select [Property].[propertyId] as propertyId, [City].[nom] as city,[title], [descr],[Property].[images], [beds], [baths],
//     [kitchens], [parkings], [price], [addres], [Property].[latitude], [Property].[longitude], [datePosted], [size], [saleType], [PropertyType].[nom] as propertyType, [Agences].[name] as agence from property left join city on property.cityId = City.cityId left join PropertyType on Property.propertyTypeId = PropertyType.propertyTypeId left join Agences ON Property.agenceId = Agences.agenceId;

//     select [cityId],[nom] from City;
//     select [propertyTypeId], [nom] from PropertyType;
//     select [agenceId], [name] from Agences;

//  `;

//     sql.connect(config, function (err) {
//       if (err) {
//         console.log(err);
//         return;
//       }

//       const request = new sql.Request();
//       request.query(query, function (err, result) {
//         if (err) {
//           console.log(err);
//           return;
//         }

//         // Extract the data from the SQL result
//         const [properties, cities, propertyTypes, agences] = result.recordsets;
//         // Build the dashboard model

//         const propertyDictionary = {};
//         properties.forEach((property) => {
//           propertyDictionary[property.propertyId] = property;
//         });

//         const citiesDictionary = {};
//         cities.forEach((city) => {
//           citiesDictionary[city.cityId] = city.nom;
//         });

//         const agencesDictionary = {};
//         agences.forEach((agence) => {
//           agencesDictionary[agence.agenceId] = agence.name;
//         });

//         res.render("property", {
//           title: "Property Management",

//           houses: propertyDictionary,
//           cities: citiesDictionary,
//           propertyTypes: propertyDictionary,
//           agences: agencesDictionary,
//         });
//       });
//     });
//   } else {
//     res.redirect("/login");
//   }
// });

module.exports = router;
