// Select the form and input fields
const form = document.getElementById("blogForm");
const title = document.getElementById("title");
const category = document.getElementById("category");
const content = document.getElementById("content");
const postedBy = document.getElementById("postedby");

// Handle form submission
form.addEventListener("submit", (e) => {
    // Prevent default form submission
    e.preventDefault();

    // Clear previous error messages
    clearErrors();

    // Perform validation
    let isValid = true;

    if (title.value.trim() === "") {
        showError(title, "Title is required.");
        isValid = false;
    }

    if (category.value.trim() === "") {
        showError(category, "Category is required.");
        isValid = false;
    }

    if (content.value.trim() === "") {
        showError(content, "Content is required.");
        isValid = false;
    }

    if (postedBy.value.trim() === "") {
        showError(postedBy, "Please select the author.");
        isValid = false;
    }

    // If all fields are valid, proceed
    if (isValid) {
        alert("Blog saved successfully!");
        form.submit(); // Submit the form
    }
});

// Function to show error message
function showError(element, message) {
    const errorDiv = element.nextElementSibling;
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

// Function to clear all error messages
function clearErrors() {
    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach((error) => (error.textContent = ""));
}

document.addEventListener("DOMContentLoaded", () => {
    const dateField = document.getElementById("date");
    const now = new Date();

    // Format the date as DD-MM-YYYY HH:mm
    const formattedDate = now.toLocaleDateString("en-GB") + " " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    // Set the value of the date field
    dateField.value = formattedDate;
});
