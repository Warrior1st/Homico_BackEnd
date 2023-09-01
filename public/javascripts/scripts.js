document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");

  if (error === "Authentication failed") {
    // Display the error message
    const errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.textContent = "Les identifiants ne sont pas corrects";
    errorMessageElement.style.display = "block"; // Show the error message
  }
});
