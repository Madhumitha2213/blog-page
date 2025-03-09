const form = document.getElementById("blogForm");
const title = document.getElementById("title");
const category = document.getElementById("category");
const content = document.getElementById("content");
const postedBy = document.getElementById("postedby");

// Handle form submission
form.addEventListener("submit", async (e) => {
    // Prevent default form submission
    e.preventDefault();
    
    // Update content from editor to textarea right before submission
    if (typeof updateTextarea === 'function') {
        updateTextarea();
    }
    
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
    if (content.value.trim() === "" || 
        content.value.trim() === '<em class="text-muted">Start typing your content here...</em>') {
        // For content, we need to find the error div differently
        const editorContainer = document.querySelector(".editor-field").parentElement;
        const errorDiv = editorContainer.querySelector(".error");
        if (errorDiv) {
            errorDiv.textContent = "Content is required.";
        }
        isValid = false;
    }
    if (postedBy.value.trim() === "") {
        showError(postedBy, "Please select the author.");
        isValid = false;
    }
    
    // If all fields are valid, proceed
    if (isValid) {
        // Collect form data
        const blogData = {
            title: title.value,
            category: category.value,
            content: content.value,
            postedBy: postedBy.value,
            publishDate: document.getElementById("date").value,
        };
        
        console.log("Submitting blog data:", blogData); // For debugging
        
        try {
            // Send a POST request to the JSON server
            const response = await fetch("http://localhost:3000/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(blogData),
            });
            
            if (response.ok) {
                const savedBlog = await response.json(); // Get the saved blog data with ID
                console.log("Blog saved successfully with ID:", savedBlog.id);
                alert("Blog saved successfully!");
                
                // Reset the form and editor content
                form.reset();
                const editor = document.getElementById("editor");
                if (editor) {
                    editor.innerHTML = '<em class="text-muted">Start typing your content here...</em>';
                }
                
                // Redirect to blog list page
                window.location.href = 'bloglist.html';
            } else {
                console.error("Server response:", response.status, response.statusText);
                alert("Failed to save the blog. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while saving the blog.");
        }
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

// Auto-generate the current date and time
document.addEventListener("DOMContentLoaded", () => {
    const dateField = document.getElementById("date");
    const now = new Date();
    // Format the date as DD/MM/YYYY HH:mm
    const formattedDate =
        now.toLocaleDateString("en-GB") +
        " " +
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    dateField.value = formattedDate;
});