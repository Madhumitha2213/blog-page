// Global variables for Quill editors
let quill;
let editQuill;

// Initialize Quill editor for new blog creation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date on page load
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const currentDate = new Date().toLocaleString();
        dateInput.value = currentDate;
    }

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
            textarea.value = quill.root.innerHTML;
        });
    }

    // Initialize blog list if on blog list page
    if (document.getElementById('blogsContainer')) {
        fetchBlogs();
    }

    // Handle form submission for new blog
    const form = document.getElementById("blogForm");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
});

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent default form submission
    
    // Get form elements
    const title = document.getElementById("title");
    const category = document.getElementById("category");
    const content = document.getElementById("content");
    const postedBy = document.getElementById("postedby");
    
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
    
    // If validation passes, proceed
    if (isValid) {
        const blogData = {
            title: title.value,
            category: category.value,
            content: content.value,
            postedBy: postedBy.value,
            publishDate: document.getElementById("date").value,
        };
        
        try {
            // POST the blog data to the JSON server
            const response = await fetch("http://localhost:3000/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(blogData),
            });
            
            if (response.ok) {
               
                window.location.href = "bloglist.html";
            } else {
                throw new Error("Failed to save the blog.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while saving the blog.");
        }
    }
}

// Show error message
function showError(element, message) {
    const errorDiv = element.nextElementSibling;
    if (errorDiv) {
        errorDiv.textContent = message;
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
                    <p>${blog.content}</p>
                    <div class="text-muted">#${blog.category}</div>
                    <div class="text-end">
                        Published: ${blog.publishDate || 'N/A'}<br>
                        ${blog.postedBy}
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
        const response = await fetch(`http://localhost:3000/post/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog');
        }

        const blog = await response.json();

        // Populate the edit form
        document.getElementById('editBlogId').value = blog.id;
        document.getElementById('editTitle').value = blog.title;
        document.getElementById('editCategory').value = blog.category;
        
        // Initialize Quill editor for editing if it doesn't exist
        if (!editQuill && document.getElementById('editEditor')) {
            editQuill = new Quill('#editEditor', {
                theme: 'snow',
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
            const editTextarea = document.getElementById('editContent');
            editQuill.on('text-change', function() {
                editTextarea.value = editQuill.root.innerHTML;
            });
        }
        
        // Set content in the editor
        if (editQuill) {
            editQuill.root.innerHTML = blog.content;
            document.getElementById('editContent').value = blog.content;
        } else {
            document.getElementById('editContent').value = blog.content;
        }
        
        document.getElementById('editPostedBy').value = blog.postedBy;

        // Open the modal
        const editModal = new bootstrap.Modal(document.getElementById('editBlogModal'));
        editModal.show();
    } catch (error) {
        console.error('Error fetching blog for editing:', error);
        alert('Failed to load blog details for editing.');
    }
}

// Update blog function
async function updateBlog() {
    const id = document.getElementById('editBlogId').value;
    const title = document.getElementById('editTitle');
    const category = document.getElementById('editCategory');
    const content = document.getElementById('editContent');
    const postedBy = document.getElementById('editPostedBy');
    
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
    
    // If validation passes, proceed
    if (isValid) {
        const updatedBlog = {
            title: title.value,
            category: category.value,
            content: content.value,
            postedBy: postedBy.value,
            publishDate: new Date().toLocaleString('en-GB')
        };

        try {
            const response = await fetch(`http://localhost:3000/post/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedBlog),
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('editBlogModal')).hide();
                fetchBlogs();
                alert('Blog updated successfully!');
            } else {
                throw new Error('Failed to update blog');
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            alert('Failed to update the blog. Please try again.');
        }
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