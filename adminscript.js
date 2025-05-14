// **Firebase Initialization (Replace with your actual config)**
const firebaseConfig = {
    apiKey: "AIzaSyBxtT17hSDupMGgZeOj9f1IUScGRDFEUZc",
    authDomain: "blog-page-ab3f9.firebaseapp.com",
    projectId: "blog-page-ab3f9",
    storageBucket: "blog-page-ab3f9.firebasestorage.app",
    messagingSenderId: "368602214392",
    appId: "1:368602214392:web:d1f5d9a3d636b090b6f00d",
    measurementId: "G-0DCW1GDKZZ"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUserId;
let allArticles = [];
let filteredArticles = [];
let editingArticleId = null;
let categories = []; // To store fetched categories

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserId = user.uid;
            document.getElementById('user-display').textContent = `Welcome, ${user.email}`;
            console.log('User authenticated:', user.uid, user.email);
            fetchArticles();
            loadCategories(); // Load categories on page load
        } else {
            console.log('No user authenticated. Redirecting to login.');
            window.location.href = 'login.html';
        }
    });

    // Event listeners for adding multiple image and video URLs
    document.getElementById('add-image-url').addEventListener('click', addImageUrlField);
    document.getElementById('add-video-url').addEventListener('click', addVideoUrlField);

    // Event listener for category selection
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('new-category-input');
    categorySelect.addEventListener('change', function() {
        newCategoryInput.style.display = this.value === 'add-new' ? 'block' : 'none';
        if (this.value === 'add-new') {
            document.getElementById('new-category').focus();
        }
    });
});

function logoutUser() {
    auth.signOut().then(() => {
        console.log('User logged out successfully.');
        window.location.href = 'blogpage.html';
    }).catch(error => {
        console.error("Error logging out:", error);
        // Display error to user (you might want to add UI for this)
    });
}

function fetchArticles() {
    console.log('Fetching articles...');
    db.collection("articles")
        .orderBy("createdAt", "desc")
        .get()
        .then((snapshot) => {
            allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('Articles fetched:', allArticles);
            filterArticles(document.getElementById('status-filter').value);
        })
        .catch(error => {
            console.error("Error fetching articles:", error);
            document.getElementById('article-list').textContent = "Error loading articles.";
        });
}

function filterArticles(status) {
    console.log('Filtering articles by status:', status);
    if (status === 'all') {
        filteredArticles = [...allArticles];
    } else {
        filteredArticles = allArticles.filter(article => article.status === status);
    }
    console.log('Filtered articles:', filteredArticles);
    renderArticleList(filteredArticles);
}

function renderArticleList(articles) {
    const articleList = document.getElementById('article-list');
    articleList.innerHTML = '';
    if (articles.length === 0) {
        articleList.textContent = "No articles found with the selected filter.";
        return;
    }
    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article-item');
        articleDiv.innerHTML = `
            <h3>${article.title}</h3>
            <span class="status ${article.status}">${article.status.charAt(0).toUpperCase() + article.status.slice(1)}</span>
            <div class="actions">
                <button class="edit-btn" onclick="openArticleEditor('${article.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteArticle('${article.id}')">Delete</button>
            </div>
        `;
        articleList.appendChild(articleDiv);
    });
    console.log('Article list rendered.');
}

function openArticleEditor(articleId) {
    editingArticleId = articleId;
    const modalTitle = document.querySelector('#article-editor-modal h2');
    const form = document.getElementById('article-form');
    form.reset();
    modalTitle.textContent = editingArticleId ? 'Edit Article' : 'Create New Article';
    document.getElementById('article-id').value = editingArticleId || '';

    // Clear existing dynamic fields
    document.getElementById('image-url-container').innerHTML = '<label for="imageUrl">Image URL:</label><input type="text" id="imageUrl" name="imageUrls[]" placeholder="Paste image URL">';
    document.getElementById('video-url-container').innerHTML = '<label for="videoUrl">YouTube/Video URL:</label><input type="text" id="videoUrl" name="videoUrls[]" placeholder="Paste YouTube/Vimeo URL">';
    document.getElementById('new-category-input').style.display = 'none';
    document.getElementById('category').value = ''; // Reset category selection

    console.log('Article editor opened. Editing ID:', editingArticleId);

    if (editingArticleId) {
        const article = allArticles.find(art => art.id === editingArticleId);
        if (article) {
            form.title.value = article.title;
            form.headline.value = article.headline || '';
            form.body.value = article.body || '';
            form['publish-toggle'].checked = article.status === 'published';
            form['schedule-date'].value = article.scheduledAt ? new Date(article.scheduledAt.toDate()).toISOString().slice(0, 16) : '';

            // Load existing image and video URLs if they exist
            if (article.imageUrls && Array.isArray(article.imageUrls)) {
                document.getElementById('image-url-container').innerHTML = '';
                article.imageUrls.forEach(url => addImageUrlField(url));
            }
            if (article.videoUrls && Array.isArray(article.videoUrls)) {
                document.getElementById('video-url-container').innerHTML = '';
                article.videoUrls.forEach(url => addVideoUrlField(url));
            }
            if (article.category) {
                document.getElementById('category').value = article.category;
                if (!categories.includes(article.category)) {
                    document.getElementById('category').value = 'add-new';
                    document.getElementById('new-category-input').style.display = 'block';
                    document.getElementById('new-category').value = article.category;
                }
            }

            console.log('Article data loaded for editing:', article);
        }
    }

    document.getElementById('article-editor-modal').style.display = 'flex';
    // Initialize rich text editor (you'll need to integrate a library)
    // if (typeof tinymce !== 'undefined') {
    //     tinymce.init({ selector: '#body' });
    // }
}

function closeArticleEditor() {
    document.getElementById('article-editor-modal').style.display = 'none';
    editingArticleId = null;
    console.log('Article editor closed.');
    // Destroy rich text editor instance if it exists
    // if (typeof tinymce !== 'undefined' && tinymce.get('body')) {
    //     tinymce.remove('body');
    // }
}

function submitArticle(event) {
    event.preventDefault();
    console.log('submitArticle function called.');
    const title = event.target.title.value;
    const headline = event.target.headline.value;
    const body = event.target.body.value;
    const publish = event.target['publish-toggle'].checked;
    const scheduleDate = event.target['schedule-date'].value;
    const articleId = event.target['article-id'].value;
    const status = publish ? 'published' : scheduleDate ? 'scheduled' : 'draft';
    const scheduledAt = scheduleDate ? new Date(scheduleDate) : null;

    // Collect image URLs
    const imageUrls = Array.from(document.querySelectorAll('#image-url-container input[type="text"]'))
        .map(input => input.value.trim())
        .filter(url => url !== '');

    // Collect video URLs
    const videoUrls = Array.from(document.querySelectorAll('#video-url-container input[type="text"]'))
        .map(input => input.value.trim())
        .filter(url => url !== '');

    // Get category
    let category = document.getElementById('category').value;
    if (category === 'add-new') {
        category = document.getElementById('new-category').value.trim();
    }

    // Ensure currentUserId is available
    if (!currentUserId) {
        console.error("Error: currentUserId is not set. Cannot save article.");
        return;
    }

    const articleData = {
        title: title,
        headline: headline,
        body: body,
        status: status,
        authorId: currentUserId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        imageUrls: imageUrls,
        videoUrls: videoUrls,
        category: category,
        ...(scheduledAt && { scheduledAt: firebase.firestore.Timestamp.fromDate(scheduledAt) }),
        // Removed single image/caption/alt-text fields
    };

    const collectionRef = db.collection("articles");

    if (articleId) {
        console.log('Updating article with ID:', articleId, articleData);
        collectionRef.doc(articleId).update(articleData)
            .then(() => {
                console.log("Article updated successfully!");
                closeArticleEditor();
                fetchArticles();
            })
            .catch(error => {
                console.error("Error updating article:", error);
                // Display error to user (you might want to add UI for this)
            });
    } else {
        articleData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        console.log('Creating new article:', articleData);
        collectionRef.add(articleData)
            .then((docRef) => {
                console.log("Article written with ID: ", docRef.id);
                closeArticleEditor();
                fetchArticles();
            })
            .catch(error => {
                console.error("Error writing article:", error);
                // Display error to user (you might want to add UI for this)
            });
    }
}

function deleteArticle(articleId) {
    if (confirm(`Are you sure you want to delete article with ID: ${articleId}?`)) {
        console.log('Deleting article with ID:', articleId);
        db.collection("articles").doc(articleId).delete()
            .then(() => {
                console.log(`Article with ID: ${articleId} successfully deleted!`);
                fetchArticles();
            })
            .catch(error => {
                console.error("Error deleting article:", error);
                // Display error to user (you might want to add UI for this)
            });
    }
}

function addImageUrlField(existingUrl = '') {
    const container = document.getElementById('image-url-container');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'imageUrls[]';
    input.placeholder = 'Image URL';
    input.value = existingUrl;
    const removeButton = createRemoveButton(input);
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '5px';
    wrapper.appendChild(input);
    wrapper.appendChild(removeButton);
    container.appendChild(wrapper);
}

function addVideoUrlField(existingUrl = '') {
    const container = document.getElementById('video-url-container');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'videoUrls[]';
    input.placeholder = 'YouTube/Vimeo URL';
    input.value = existingUrl;
    const removeButton = createRemoveButton(input);
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '5px';
    wrapper.appendChild(input);
    wrapper.appendChild(removeButton);
    container.appendChild(wrapper);
}

function createRemoveButton(inputToRemove) {
    const button = document.createElement('button');
    button.textContent = 'Remove';
    button.type = 'button';
    button.style.marginLeft = '5px';
    button.addEventListener('click', function() {
        this.parentNode.remove();
    });
    return button;
}

function loadCategories() {
    const categorySelect = document.getElementById('category');
    db.collection("categories") // Assuming you have a 'categories' collection
        .orderBy("name")
        .get()
        .then((snapshot) => {
            categories = snapshot.docs.map(doc => doc.data().name);
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
            // Add the "Add New Category" option at the end
            const addNewOption = document.createElement('option');
            addNewOption.value = 'add-new';
            addNewOption.textContent = '+ Add New Category';
            categorySelect.appendChild(addNewOption);
        })
        .catch(error => {
            console.error("Error loading categories:", error);
        });
}

// Placeholder for image upload function (removed as we are using URLs)
// function uploadImage(file) { ... }

// Placeholder for filterArticles by status (already implemented)
// function filterArticles(status) { ... }













// Drawer
// Select Elements
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const body = document.body;

// Toggle Mobile Menu
menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    mobileMenu.classList.toggle("active");
});

// Close Menu on Click Outside
document.addEventListener("click", (e) => {
    if (
        !mobileMenu.contains(e.target) &&
        !menuToggle.contains(e.target) &&
        mobileMenu.classList.contains("active")
    ) {
        mobileMenu.classList.remove("active");
        menuToggle.classList.remove("active");
    }
});

// Auto-close Drawer on Screen Resize
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        mobileMenu.classList.remove("active");
        menuToggle.classList.remove("active");
    }
});




        // Update progress bar on scroll
        window.onscroll = function () {
            let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            let scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            let scrolled = (scrollTop / scrollHeight) * 100;
            document.getElementById("progressBar").style.width = scrolled + "%";
        };