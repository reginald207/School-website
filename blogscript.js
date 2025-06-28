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
const db = firebase.firestore();

const blogContainer = document.getElementById('blog-container');
const searchInput = document.getElementById('search-input');
const heroSection = document.getElementById('hero-section');
const adminLoginButton = document.getElementById('admin-login-button');

let allBlogPosts = [];
let currentDisplayedPosts = [];
let isFullPostView = false; // Track if currently in full post view

// --- Custom Message Box for Copy Link ---
function showMessageBox(message, type = 'info') {
    let msgBox = document.getElementById('custom-message-box');
    if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.id = 'custom-message-box';
        document.body.appendChild(msgBox);
    }
    msgBox.textContent = message;
    msgBox.className = 'custom-message-box ' + type;
    msgBox.style.display = 'block';

    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 3000);
}

// Add CSS for the message box (ideally, this should be in blogstyle.css)
const style = document.createElement('style');
style.innerHTML = `
    .custom-message-box {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4CAF50; /* Green for info */
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 1em;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: none; /* Hidden by default */
        animation: fadeInOut 3s forwards;
    }
    .custom-message-box.error {
        background-color: #f44336; /* Red for error */
    }
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        10% { opacity: 1; transform: translateX(-50%) translateY(0); }
        90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(style);


function displayPosts(postsToDisplay) {
    isFullPostView = false; // Set flag to false when showing excerpts

    // Ensure hero section and search input are visible and enabled
    if (heroSection) {
        heroSection.style.display = 'flex'; // Restore display
        heroSection.style.visibility = 'visible';
        heroSection.style.opacity = '1';
        heroSection.style.height = '400px'; // Restore original height
        heroSection.style.padding = '120px'; // Restore original padding
        heroSection.style.margin = '0 0 0 0'; // Restore original margin
    }
    // Restore admin button visibility
    if (adminLoginButton) {
        adminLoginButton.style.display = 'flex'; // Restore display
        adminLoginButton.style.visibility = 'visible';
        adminLoginButton.style.opacity = '1';
    }
    if (searchInput) {
        searchInput.style.visibility = 'visible';
        searchInput.style.opacity = '1';
        searchInput.disabled = false;
        // Ensure searchInput is in hero-content (it should not be moved to sidebar anymore)
        if (searchInput.parentNode && searchInput.parentNode.id !== 'hero-content') {
            document.querySelector('.hero-content').appendChild(searchInput);
        }
    }
    document.body.classList.remove('full-post-active'); // Remove full post specific body class

    blogContainer.innerHTML = ''; // Clear previous content
    blogContainer.classList.remove('full-post-layout'); // Remove full-post-layout class

    postsToDisplay.forEach((post, index) => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('blog-post');
        setTimeout(() => {
            postDiv.classList.add('loaded');
        }, index * 100);

        // Image Wrapper
        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('blog-post-image-wrapper');
        if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
            const image = document.createElement('img');
            image.src = post.imageUrls[0]; // Display the first image
            image.alt = post.title; // Alt text for accessibility
            imageWrapper.appendChild(image);
        } else {
            // Placeholder for posts without images
            const placeholder = document.createElement('img');
            placeholder.src = `https://placehold.co/400x180/e0e0e0/555555?text=No+Image`; // Generic placeholder
            placeholder.alt = "No image available";
            imageWrapper.appendChild(placeholder);
        }
        postDiv.appendChild(imageWrapper);

        // Content Area
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('blog-post-content');

        const title = document.createElement('h2');
        title.textContent = post.title;
        contentDiv.appendChild(title);

        const meta = document.createElement('p');
        meta.classList.add('post-meta');
        const author = post.author || 'admin'; // Assuming admin as default author
        const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        const category = post.category || 'News';
        meta.innerHTML = `<span>${author} - ${date}</span> <span>${category}</span>`;
        contentDiv.appendChild(meta);

        const excerpt = document.createElement('p');
        excerpt.classList.add('excerpt');
        excerpt.textContent = post.excerpt || (post.body ? post.body.substring(0, 150) + '...' : 'No excerpt available.');
        contentDiv.appendChild(excerpt);

        const readMoreBtn = document.createElement('a');
        readMoreBtn.classList.add('read-more-btn');
        readMoreBtn.href = `#post-${post.id}`; // Basic in-page linking
        readMoreBtn.textContent = 'Continue Reading →'; // Text as in the image
        readMoreBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor jump
            showFullPost(post);
        });
        contentDiv.appendChild(readMoreBtn);

        postDiv.appendChild(contentDiv);
        blogContainer.appendChild(postDiv);
    });
    currentDisplayedPosts = postsToDisplay;
}

async function showFullPost(post) {
    console.log("showFullPost function called for post:", post);
    isFullPostView = true; // Set flag to true when showing full post

    // Hide admin button and search input when in full post view
    if (adminLoginButton) {
        adminLoginButton.style.opacity = '0';
        adminLoginButton.style.visibility = 'hidden';
        adminLoginButton.style.display = 'none';
    }
    if (searchInput) {
        searchInput.style.visibility = 'hidden'; // Hide search input
        searchInput.style.opacity = '0';
        searchInput.disabled = true; // Disable search input
    }
    // Hero section remains visible as per new request.

    document.body.classList.add('full-post-active'); // Add full post specific body class

    blogContainer.innerHTML = ''; // Clear previous content
    blogContainer.classList.add('full-post-layout'); // Add class for 2-column layout

    // Create main content area and sidebar
    const fullPostContentArea = document.createElement('div');
    fullPostContentArea.classList.add('full-post-main-content');

    const fullPostSidebar = document.createElement('div');
    fullPostSidebar.classList.add('full-post-sidebar');

    // --- Populate Full Post Main Content ---
    const postHeader = document.createElement('div');
    postHeader.classList.add('main-post-header');
    const title = document.createElement('h1'); // Changed to h1 as per image
    title.textContent = post.title;
    postHeader.appendChild(title);
    fullPostContentArea.appendChild(postHeader);

    const meta = document.createElement('p');
    meta.classList.add('main-post-meta');
    meta.innerHTML = `<span><i class="fas fa-user-circle"></i> ${post.author || 'admin'}</span> • <span><i class="far fa-calendar-alt"></i> ${post.createdAt ? post.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span> • <span><i class="fas fa-tag"></i> ${post.category || 'News'}</span>`;
    fullPostContentArea.appendChild(meta);

    // Main Image Container (if exists)
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('full-post-image-container');
        const mainImage = document.createElement('img');
        mainImage.src = post.imageUrls[0];
        mainImage.alt = post.title;
        imageContainer.appendChild(mainImage);
        fullPostContentArea.appendChild(imageContainer);
    } else {
        // Placeholder for main image
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('full-post-image-container');
        const placeholder = document.createElement('img');
        placeholder.src = `https://placehold.co/900x450/e0e0e0/555555?text=No+Main+Image`;
        placeholder.alt = "No image available";
        imageContainer.appendChild(placeholder);
        fullPostContentArea.appendChild(imageContainer);
    }

    // Other images below main image (if more than one image exists)
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 1) {
        const otherImagesContainer = document.createElement('div');
        otherImagesContainer.classList.add('full-post-other-images'); // Changed class name
        otherImagesContainer.dataset.imageCount = post.imageUrls.length -1; // Count of additional images

        post.imageUrls.slice(1).forEach((imageUrl, index) => { // Start from the second image
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = `Image ${index + 2}`;
            otherImagesContainer.appendChild(image);
        });
        fullPostContentArea.appendChild(otherImagesContainer);
    }

    // Headline (if exists)
    if (post.headline) {
        const headlineElement = document.createElement('h3');
        headlineElement.classList.add('post-headline');
        headlineElement.textContent = post.headline;
        fullPostContentArea.appendChild(headlineElement);
    }

    // Article Body
    const fullText = document.createElement('div');
    fullText.classList.add('full-post-text');
    fullText.innerHTML = post.body || '';
    fullPostContentArea.appendChild(fullText);

    // Embedded YouTube Videos (at the end of article, before "You Might Also Like")
    if (post.videoUrls && Array.isArray(post.videoUrls) && post.videoUrls.length > 0) {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('full-post-videos');
        videoContainer.dataset.videoCount = post.videoUrls.length;
        post.videoUrls.forEach(videoUrl => {
            let videoId = null;
            const regularMatch = videoUrl.match(/[?&]v=([^&]+)/);
            if (regularMatch && regularMatch[1]) videoId = regularMatch[1];
            const shortMatch = videoUrl.match(/youtu\.be\/([^?&]+)/);
            if (shortMatch && shortMatch[1]) videoId = shortMatch[1];

            if (videoId) {
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                const iframe = document.createElement('iframe');
                iframe.width = '560';
                iframe.height = '315';
                iframe.src = embedUrl;
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                videoContainer.appendChild(iframe);
            } else {
                const message = document.createElement('p');
                message.textContent = `Invalid YouTube link: ${videoUrl}`;
                videoContainer.appendChild(message);
            }
        });
        fullPostContentArea.appendChild(videoContainer);
    }

    // "You Might Also Like" Section
    const youMightAlsoLikeSection = document.createElement('div');
    youMightAlsoLikeSection.classList.add('you-might-also-like');
    youMightAlsoLikeSection.innerHTML = '<h3>YOU MIGHT ALSO LIKE</h3><div class="you-might-also-like-grid"></div>';
    fullPostContentArea.appendChild(youMightAlsoLikeSection);

    // Add back button below the "You Might Also Like" section
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to All Posts';
    backButton.classList.add('full-post-back-button'); // New class for styling
    backButton.addEventListener('click', () => displayPosts(allBlogPosts));
    fullPostContentArea.appendChild(backButton);


    // Add main content and sidebar to the blog container
    blogContainer.appendChild(fullPostContentArea);
    blogContainer.appendChild(fullPostSidebar);

    // --- Populate Sidebar (Recent Posts) ---
    // Recent Posts (replacing Latest News)
    const recentPostsSectionTitle = document.createElement('h3');
    recentPostsSectionTitle.textContent = 'Recent Posts';
    fullPostSidebar.appendChild(recentPostsSectionTitle);

    const recentPostsList = document.createElement('div');
    recentPostsList.classList.add('recent-posts-list');
    fullPostSidebar.appendChild(recentPostsList);

    const recentPostsSnapshot = await db.collection("articles")
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

    if (recentPostsSnapshot.docs.length > 0) {
        recentPostsSnapshot.docs.forEach(itemDoc => {
            const item = { id: itemDoc.id, ...itemDoc.data() };
            if (item.id === post.id) return; // Skip the current post

            const newsItemDiv = document.createElement('a');
            newsItemDiv.href = `#post-${item.id}`;
            newsItemDiv.classList.add('sidebar-news-item');
            newsItemDiv.addEventListener('click', (e) => { e.preventDefault(); showFullPost(item); });

            const imageUrl = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://placehold.co/60x60/e0e0e0/555555?text=No+Img';
            const date = item.createdAt ? item.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

            newsItemDiv.innerHTML = `
                <img src="${imageUrl}" alt="${item.title}" onerror="this.src='https://placehold.co/60x60/e0e0e0/555555?text=No+Img';">
                <div class="sidebar-news-item-content">
                    <h4>${item.title}</h4>
                    <p class="meta">${date}</p>
                </div>
            `;
            recentPostsList.appendChild(newsItemDiv);
        });
    } else {
        recentPostsList.innerHTML = '<p>No recent posts found.</p>';
    }

    // Populate "You Might Also Like" section *after* everything else is rendered
    const youMightAlsoLikeGrid = youMightAlsoLikeSection.querySelector('.you-might-also-like-grid');
    
    // Fetch all published articles to filter client-side for case-insensitivity
    const allPublishedArticlesSnapshot = await db.collection("articles")
        .where("status", "==", "published")
        .orderBy("createdAt", "desc") // Order by date descending initially
        .get();

    const allPublishedArticles = allPublishedArticlesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }));

    const relatedNews = allPublishedArticles
        .filter(item => 
            item.id !== post.id && // Exclude the current post
            item.category && post.category && // Ensure both categories exist
            item.category.toLowerCase() === post.category.toLowerCase() // Case-insensitive category match
        )
        .slice(0, 2); // Take the latest two related news items after filtering and sorting

    if (relatedNews.length > 0) {
        relatedNews.forEach(item => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('blog-post'); // Reusing existing card styles
            cardDiv.style.opacity = '1'; // Ensure visible right away
            cardDiv.style.transform = 'translateY(0)'; // Ensure visible right away

            const imageUrl = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://placehold.co/400x180/e0e0e0/555555?text=No+Image';
            const date = item.createdAt ? item.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

            cardDiv.innerHTML = `
                <div class="blog-post-image-wrapper">
                    <img src="${imageUrl}" alt="${item.title}" onerror="this.src='https://placehold.co/400x180/e0e0e0/555555?text=No+Image';">
                </div>
                <div class="blog-post-content">
                    <h2>${item.title}</h2>
                    <p class="post-meta"><span>${item.author || 'admin'} - ${date}</span> <span>${item.category || 'News'}</span></p>
                    <p class="excerpt">${item.excerpt || (item.body ? item.body.substring(0, 100) + '...' : 'No excerpt available.')}</p>
                    <a href="#post-${item.id}" class="read-more-btn">Continue Reading →</a>
                </div>
            `;
            cardDiv.addEventListener('click', (e) => { e.preventDefault(); showFullPost(item); }); // Make cards clickable
            youMightAlsoLikeGrid.appendChild(cardDiv);
        });
    } else {
        youMightAlsoLikeGrid.innerHTML = '<p style="text-align: center; color: #777;">No related news found in this category.</p>';
    }
}


function fetchBlogPosts() {
    db.collection("articles")
        .where("status", "==", "published") // Only fetch published posts for the blog
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
            allBlogPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt // Ensure createdAt is kept as Timestamp
            }));
            displayPosts(allBlogPosts);
        }, (error) => {
            console.error("Error fetching blog posts:", error);
            blogContainer.textContent = "Failed to load blog posts.";
        });
}

// Search functionality
searchInput.addEventListener('input', (event) => {
    // Search input now always triggers a search and returns to main grid view
    const searchTerm = event.target.value.toLowerCase();
    const filteredPosts = allBlogPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        (post.body && post.body.toLowerCase().includes(searchTerm)) ||
        (post.headline && post.headline.toLowerCase().includes(searchTerm)) ||
        (post.category && post.category.toLowerCase().includes(searchTerm))
    );
    displayPosts(filteredPosts); // Always display filtered results as the main grid view
});

document.addEventListener('DOMContentLoaded', () => {
    fetchBlogPosts();
});

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
