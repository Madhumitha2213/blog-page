
    // Initialize date on page load
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const currentDate = new Date().toLocaleString();
        dateInput.value = currentDate;
    }

    // First create the hidden textarea for content if it doesn't exist
    if (document.getElementById('editor') && !document.getElementById('content')) {
        const contentTextarea = document.createElement('textarea');
        contentTextarea.id = 'content';
        contentTextarea.name = 'content';
        contentTextarea.style.display = 'none';
        document.getElementById('editor').parentNode.appendChild(contentTextarea);
    }

let quill;
let editQuill;
let isEditMode = false;
let editBlogId = null;

// Initialize Quill editor for new blog creation
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded");
    
    // Initialize Quill editor for new blog form
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Start typing your content here...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                ]
            }
        });

        // Update hidden textarea on editor change
        const textarea = document.getElementById('content');
        quill.on('text-change', function() {
            console.log("Quill content changed:", quill.root.innerHTML);
            textarea.value = quill.root.innerHTML;
        });
        
        // Initialize textarea with empty content to prevent undefined errors
        if (!textarea.value) {
            textarea.value = '';
        }
    }

    // Check if we're in edit mode by looking at URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        console.log("Edit mode detected, ID:", editId);
        isEditMode = true;
        editBlogId = editId;
        
        // Update page title and button text
        const pageTitle = document.querySelector('.card-title');
        if (pageTitle) pageTitle.textContent = 'Edit Blog';
        
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) submitButton.textContent = 'Update';
        
        // Load blog data from localStorage
        const blogData = JSON.parse(localStorage.getItem('editBlogData'));
        if (blogData) {
            console.log("Loading blog data from localStorage:", blogData);
            populateFormWithBlogData(blogData);
        } else {
            // If no data in localStorage, fetch it directly
            console.log("Fetching blog data from server");
            fetchBlogForEditing(editId);
        }
    } else {
        // Ensure we're in create mode (not edit mode)
        console.log("Create mode initialized");
        isEditMode = false;
        editBlogId = null;
        
        // Clear any stale data in localStorage
        localStorage.removeItem('editBlogData');
    }

    // Fetch and populate categories
    fetchCategories();

    // Initialize blog list if on blog list page
    if (document.getElementById('blogsContainer')) {
        fetchBlogs();
    }

    // Handle form submission for new blog
    const form = document.getElementById("blogForm");
    if (form) {
        form.addEventListener("submit", function(e) {
            console.log("Form submitted");
            handleFormSubmit(e);
        });
    }

    // Initialize edit mode Quill editor in the modal
    if (document.getElementById('editEditor')) {
        editQuill = new Quill('#editEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ]
            }
        });

        // Update hidden textarea when edit editor changes
        const editContent = document.getElementById('editContent');
        if (editContent) {
            editQuill.on('text-change', function() {
                editContent.value = editQuill.root.innerHTML;
            });
        }
    }
});

// Fetch categories for dropdown
async function fetchCategories() {
    const categoryDropdown = document.getElementById('category');
    if (!categoryDropdown) return;

    try {
        const response = await fetch('http://localhost:3000/categories');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const categories = await response.json();
        
        // Clear existing options
        categoryDropdown.innerHTML = '<option value="">Select Category</option>';
        
        // Add categories to dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Function to populate form with blog data
function populateFormWithBlogData(blog) {
    console.log("Populating form with blog data:", blog);
    
    if (!blog) {
        console.error("No blog data provided");
        return;
    }
    
    // Set form values
    const titleElement = document.getElementById('title');
    const categoryElement = document.getElementById('category');
    const postedByElement = document.getElementById('postedby');
    
    if (titleElement) titleElement.value = blog.title || '';
    if (categoryElement) categoryElement.value = blog.category || '';
    if (postedByElement) postedByElement.value = blog.postedBy || '';
    
    // Set content in Quill editor
    if (quill) {
        console.log("Setting Quill content:", blog.content);
        
        // Set Quill content safely
        quill.setContents([]);
        quill.clipboard.dangerouslyPasteHTML(0, blog.content || '');
        
        // Ensure the hidden textarea also gets updated
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.value = blog.content || '';
            console.log("Set content textarea value:", contentElement.value);
        }
    }
    
    // Update date field to show original publish date
    const dateElement = document.getElementById('date');
    if (dateElement) dateElement.value = blog.publishDate || new Date().toLocaleString();
}

// Fetch blog data directly when localStorage is not available
async function fetchBlogForEditing(id) {
    try {
        const response = await fetch(`http://localhost:3000/post/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog');
        }

        const blog = await response.json();
        console.log("Fetched blog for editing:", blog);
        populateFormWithBlogData(blog);
    } catch (error) {
        console.error('Error fetching blog for editing:', error);
        alert('Failed to load blog details for editing.');
        // Redirect back to blog list if we can't load the blog
        window.location.href = 'bloglist.html';
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent default form submission
    console.log("Processing form submission, isEditMode:", isEditMode);
    
    // Get form elements
    const title = document.getElementById("title");
    const category = document.getElementById("category");
    const content = document.getElementById("content");
    const postedBy = document.getElementById("postedby");
    
    // Ensure content is properly set from Quill before submission
    if (quill) {
        content.value = quill.root.innerHTML;
        console.log("Final content value:", content.value);
    }
    
    // Clear previous error messages
    clearErrors();
    
    // Perform validation
    let isValid = true;
    if (!title || title.value.trim() === "") {
        showError(title, "Title is required.");
        isValid = false;
    }
    if (!category || category.value.trim() === "") {
        showError(category, "Category is required.");
        isValid = false;
    }
    if (!content || content.value.trim() === "") {
        // Show error near the Quill editor
        const editorContainer = document.getElementById('editor');
        if (editorContainer) {
            const errorDiv = editorContainer.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('error')) {
                errorDiv.textContent = "Content is required.";
            } else {
                const newErrorDiv = document.createElement('div');
                newErrorDiv.className = 'error text-danger mt-1';
                newErrorDiv.textContent = "Content is required.";
                editorContainer.parentNode.insertBefore(newErrorDiv, editorContainer.nextSibling);
            }
        }
        isValid = false;
    }
    if (!postedBy || postedBy.value.trim() === "") {
        showError(postedBy, "Please select the author.");
        isValid = false;
    }
    
    // If validation passes, proceed
    if (isValid) {
        const blogData = {
            title: title.value,
            category: category.value,
            content: content.value,
            postedBy: postedBy.value,
            publishDate: document.getElementById("date").value,
        };
        
        console.log("Blog data to be sent:", blogData);
        
        try {
            let response;
            
            if (isEditMode && editBlogId) {
                console.log("Updating blog with ID:", editBlogId);
                // Update existing blog
                response = await fetch(`http://localhost:3000/post/${editBlogId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(blogData),
                });
            } else {
                console.log("Creating new blog");
                // Create new blog
                response = await fetch("http://localhost:3000/post", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(blogData),
                });
            }
            
            console.log("Response status:", response.status);
                       // Inside handleFormSubmit function, replace the success block with this:
            if (response.ok) {
                // Clean up localStorage
                localStorage.removeItem('editBlogData');
                
                // Redirect to blog list page immediately without alert
                window.location.href = "bloglist.html";
            } else {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error(isEditMode ? "Failed to update the blog." : "Failed to save the blog.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "An error occurred while processing the blog.");
        }
    } else {
        console.log("Form validation failed");
    }
}

// Show error message
function showError(element, message) {
    if (!element) return;
    
    const errorDiv = element.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error')) {
        errorDiv.textContent = message;
    } else {
        // Create error div if it doesn't exist
        const newErrorDiv = document.createElement('div');
        newErrorDiv.className = 'error text-danger mt-1';
        newErrorDiv.textContent = message;
        element.parentNode.insertBefore(newErrorDiv, element.nextSibling);
    }
}

// Clear error messages
function clearErrors() {
    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach((error) => {
        error.textContent = "";
    });
}

// Redirect functions
function redirectToBlogList() {
    window.location.href = 'bloglist.html';
}

function redirectToCreateBlog() {
    // Clear any editing data before redirecting
    localStorage.removeItem('editBlogData');
    window.location.href = 'index.html';
}

// Fetch blogs from the JSON server and display them
async function fetchBlogs() {
    const blogsContainer = document.getElementById('blogsContainer');
    if (!blogsContainer) return;

    try {
        const response = await fetch('http://localhost:3000/post');
        if (!response.ok) {
            throw new Error('Failed to fetch blogs');
        }

        const blogs = await response.json();
        console.log("Fetched blogs:", blogs);

        // Clear existing content
        blogsContainer.innerHTML = '';

        if (blogs.length === 0) {
            blogsContainer.innerHTML = '<p>No blogs available.</p>';
        } else {
            blogs.forEach((blog, index) => {
                const blogCard = document.createElement('div');
                blogCard.className = 'card mb-3 p-3';

                blogCard.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <h5>#${index + 1} ${blog.title}</h5>
                        <div class="blog-actions">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editBlog('${blog.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <a href="javascript:deleteBlog('${blog.id}')" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-trash"></i> Delete
                            </a>
                        </div>
                    </div>
                    <div>${blog.content}</div>
                    <div class="text-muted mt-2">#${blog.category}</div>
                    <div class="text-end mt-2">
                        <small>Published: ${blog.publishDate || 'N/A'}</small><br>
                        <small>By: ${blog.postedBy}</small>
                    </div>
                `;

                blogsContainer.appendChild(blogCard);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        blogsContainer.innerHTML = '<p>Failed to load blogs. Please try again later.</p>';
    }
}

// Edit blog function
async function editBlog(id) {
    try {
        console.log("Editing blog with ID:", id);
        const response = await fetch(`http://localhost:3000/post/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog');
        }

        const blog = await response.json();
        console.log("Blog data for editing:", blog);
        
        // Store blog data in localStorage
        localStorage.setItem('editBlogData', JSON.stringify(blog));
        
        // Redirect to index.html with edit parameter
        window.location.href = 'index.html?edit=' + id;
    } catch (error) {
        console.error('Error fetching blog for editing:', error);
        alert('Failed to load blog details for editing.');
    }
}

// Delete blog function (shows confirmation modal)
function deleteBlog(id) {
    document.getElementById('deleteBlogId').value = id;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteBlogModal'));
    deleteModal.show();
}

// Confirm delete function
async function confirmDelete() {
    const id = document.getElementById('deleteBlogId').value;
    console.log("Deleting blog with ID:", id);

    try {
        const response = await fetch(`http://localhost:3000/post/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('deleteBlogModal')).hide();
            fetchBlogs();
            alert('Blog deleted successfully!');
        } else {
            throw new Error('Failed to delete blog');
        }
    } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete the blog. Please try again later.');
    }
}