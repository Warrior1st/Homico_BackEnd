// JavaScript code in your Pug template or external JavaScript file
document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll("a.edit");

  editButtons.forEach((editButton) => {
    editButton.addEventListener("click", function (event) {
      event.preventDefault();
      resetEditModal();
      const propertyId = this.getAttribute("data-property-id");
      // You now have the 'propertyId' associated with the clicked row

      // Use 'propertyId' to look up the property data in your dictionary
      makeAjaxRequest(propertyId);
    });
  });
});
function resetEditModal() {
  const modal = document.querySelector("#editEmployeeModal");

  const propertyIdField = modal.querySelector('input[name="propertyId"]');
  const nomInput = modal.querySelector('input[name="nom"]');
  const descriptionTextarea = modal.querySelector(
    'textarea[name="description"]'
  );
  const adresseInput = modal.querySelector('input[name="adresse"]');
  const chambresInput = modal.querySelector('input[name="chambres"]');
  const bainsInput = modal.querySelector('input[name="bains"]');
  const cuisinesInput = modal.querySelector('input[name="cuisines"]');
  const parkingsInput = modal.querySelector('input[name="parkings"]');
  const prixInput = modal.querySelector('input[name="prix"]');
  const latitudeInput = modal.querySelector('input[name="latitude"]');
  const longitudeInput = modal.querySelector('input[name="longitude"]');
  const tailleInput = modal.querySelector('input[name="taille"]');
  const typeVenteSelect = modal.querySelector('input[name="typeVente"]');
  const typeProprieteSelect = modal.querySelector(
    'select[name="typePropriete"]'
  );
  const villeSelect = modal.querySelector('select[name="ville"]');
  const agenceSelect = modal.querySelector('select[name="agence"]');

  propertyIdField.value = "";
  nomInput.value = "";
  descriptionTextarea.value = "";
  adresseInput.value = "";
  chambresInput.value = "";
  bainsInput.value = "";
  cuisinesInput.value = "";
  parkingsInput.value = "";
  prixInput.value = "";
  latitudeInput.value = "";
  longitudeInput.value = "";
  tailleInput.value = "";
  typeVenteSelect.value = "";

  //Clean the select dropdowns
  while (
    villeSelect.options.length > 0 ||
    typeProprieteSelect.options.length > 0 ||
    agenceSelect.options.length > 0
  ) {
    if (villeSelect.options.length > 0) {
      villeSelect.remove(0);
    }
    if (typeProprieteSelect.options.length > 0) {
      typeProprieteSelect.remove(0);
    }
    if (agenceSelect.options.length > 0) {
      agenceSelect.remove(0);
    }
  }

  //Clean the images
  const container = document.getElementById("existing-images-container");

  // Remove all child elements from the container
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function populateEditModal(response) {
  const modal = document.querySelector("#editEmployeeModal");
  var property = response.prop;
  var agencies = response.agency;
  var cities = response.city;
  var propType = response.propType;

  //Refactor the image sources
  const imageIdsArray = property[0].images.split(";");

  // Initialize an array to store image objects
  const existingImages = [];

  // For each ID in the array, construct the image URL and add it to the array
  let i = 0;
  imageIdsArray.forEach((imageId) => {
    // Assuming your images are stored in a specific directory, adjust the path accordingly
    const imageUrl = `https://homico.azurewebsites.net/images/${imageId}.jpg`;

    // Add the image object to the array
    existingImages.push({
      id: i, // You can keep the original image ID
      url: imageUrl, // Constructed image URL
    });
    i++;
  });

  appendExistingImages(existingImages);

  // Access the form elements within the modal
  const propertyIdField = modal.querySelector('input[name="propertyId"]');
  const nomInput = modal.querySelector('input[name="nom"]');
  const descriptionTextarea = modal.querySelector(
    'textarea[name="description"]'
  );
  const adresseInput = modal.querySelector('input[name="adresse"]');
  const chambresInput = modal.querySelector('input[name="chambres"]');
  const bainsInput = modal.querySelector('input[name="bains"]');
  const cuisinesInput = modal.querySelector('input[name="cuisines"]');
  const parkingsInput = modal.querySelector('input[name="parkings"]');
  const prixInput = modal.querySelector('input[name="prix"]');
  const latitudeInput = modal.querySelector('input[name="latitude"]');
  const longitudeInput = modal.querySelector('input[name="longitude"]');
  const tailleInput = modal.querySelector('input[name="taille"]');
  const typeVenteSelect = modal.querySelector('input[name="typeVente"]');
  const typeProprieteSelect = modal.querySelector(
    'select[name="typePropriete"]'
  );
  const villeSelect = modal.querySelector('select[name="ville"]');
  const agenceSelect = modal.querySelector('select[name="agence"]');

  // Set the values of the form elements based on the property object
  propertyIdField.value = property[0].propertyId;
  nomInput.value = property[0].title;
  descriptionTextarea.value = property[0].descr;
  adresseInput.value = property[0].addres;
  chambresInput.value = property[0].beds;
  bainsInput.value = property[0].baths;
  cuisinesInput.value = property[0].kitchens;
  parkingsInput.value = property[0].parkings;
  prixInput.value = property[0].price;
  latitudeInput.value = property[0].latitude;
  longitudeInput.value = property[0].longitude;
  tailleInput.value = property[0].size;

  // Set the selected option in the selects based on the property object
  typeVenteSelect.value = property[0].saleType;

  propType.forEach(function (value) {
    let option = document.createElement("option");
    option.text = value.nom;
    option.value = value.propertyTypeId;

    if (value === property[0].propertyType) {
      option.selected = true;
    }
    typeProprieteSelect.appendChild(option);
  });

  cities.forEach(function (value) {
    let option = document.createElement("option");
    option.text = value.nom;
    option.value = value.cityId;

    if (value === property[0].city) {
      option.selected = true;
    }

    villeSelect.appendChild(option);
  });

  agencies.forEach(function (value) {
    let option = document.createElement("option");
    option.text = value.name;
    option.value = value.agenceId;

    if (value === property[0].agence) {
      option.selected = true;
    }

    agenceSelect.appendChild(option);
  });

  $("#editEmployeeModal").modal("show");
}

//Update the image preview component
function previewImage(event) {
  const imagePreview = document.getElementById("image-preview");
  const fileInput = event.target;
  const files = fileInput.files;

  if (files.length > 0) {
    const file = files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };

    reader.readAsDataURL(file);
  } else {
    // If no files are selected, clear the image preview
    imagePreview.src = "";
  }
}

// Define a function to append existing images
function appendExistingImages(existingImages) {
  const container = document.getElementById("existing-images-container");

  existingImages.forEach((image) => {
    const existingImageDiv = document.createElement("div");
    existingImageDiv.classList.add("existing-image");

    const imgElement = document.createElement("img");
    imgElement.src = image.url;
    imgElement.alt = "Existing Image";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-image");
    deleteButton.type = "button";
    deleteButton.dataset.imageId = image.id;
    deleteButton.textContent = "Supprimer";

    existingImageDiv.appendChild(imgElement);
    existingImageDiv.appendChild(deleteButton);

    container.appendChild(existingImageDiv);
  });
}

function makeAjaxRequest(propId) {
  // Make an AJAX request to fetch options based on propertyTypeId
  $.ajax({
    url: "/property/mngmntPropertyType", // Replace with the actual route to fetch options
    method: "POST",
    data: { propId: propId },
    success: function (response) {
      populateEditModal(response);
    },
    error: function (error) {
      console.error("Error fetching options:", error);
    },
  });
}
