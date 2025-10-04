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
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

let allBlogPosts = [];
let currentDisplayedPosts = [];
let isFullPostView = false;
let currentPostIndex = -1;
let searchTimeout = null;

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

// Scroll to Top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button based on scroll position
function toggleScrollToTopButton() {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

// Calculate reading time
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(words / wordsPerMinute);
    return readingTimeMinutes;
}

// Generate share URLs
function generateShareUrls(post) {
    const currentUrl = encodeURIComponent(window.location.href.split('#')[0] + `#post-${post.id}`);
    const title = encodeURIComponent(post.title);
    
    return {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${title}&url=${currentUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
        whatsapp: `https://wa.me/?text=${title}%20${currentUrl}`
    };
}

// Copy URL to clipboard
function copyUrlToClipboard(post) {
    const url = window.location.href.split('#')[0] + `#post-${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
        showMessageBox('Link copied to clipboard!');
    }).catch(err => {
        showMessageBox('Failed to copy link', 'error');
        console.error('Could not copy text: ', err);
    });
}

// Handle hash changes for deep linking
function handleHashChange() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
        const postId = hash.substring(6);
        const post = allBlogPosts.find(p => p.id === postId);
        if (post) {
            showFullPost(post);
        }
    }
}

// Find post index in current displayed posts
function findPostIndex(postId) {
    return currentDisplayedPosts.findIndex(p => p.id === postId);
}

// Navigate to next/previous post
function navigatePost(direction) {
    if (currentPostIndex === -1 || !isFullPostView) return;
    
    let newIndex = currentPostIndex + direction;
    
    // Check bounds
    if (newIndex < 0) newIndex = currentDisplayedPosts.length - 1;
    if (newIndex >= currentDisplayedPosts.length) newIndex = 0;
    
    const post = currentDisplayedPosts[newIndex];
    showFullPost(post);
}

function displayPosts(postsToDisplay) {
    isFullPostView = false;
    currentPostIndex = -1;

    // Ensure hero section and search input are visible and enabled
    if (heroSection) {
        heroSection.style.display = 'flex';
        heroSection.style.visibility = 'visible';
        heroSection.style.opacity = '1';
        heroSection.style.height = '400px';
        heroSection.style.padding = '120px';
        heroSection.style.margin = '0 0 0 0';
    }
    
    if (adminLoginButton) {
        adminLoginButton.style.display = 'flex';
        adminLoginButton.style.visibility = 'visible';
        adminLoginButton.style.opacity = '1';
    }
    
    if (searchInput) {
        searchInput.style.visibility = 'visible';
        searchInput.style.opacity = '1';
        searchInput.disabled = false;
        // Ensure searchInput is in hero-content
        if (searchInput.parentNode && searchInput.parentNode.id !== 'hero-content') {
            document.querySelector('.hero-content').appendChild(searchInput);
        }
        // Maintain focus on search input
        searchInput.focus();
    }
    
    document.body.classList.remove('full-post-active');

    blogContainer.innerHTML = '';
    blogContainer.classList.remove('full-post-layout');

    // Show no results message if no posts found
    if (postsToDisplay.length === 0) {
        const noResults = document.createElement('div');
        noResults.classList.add('no-results');
        noResults.innerHTML = `
            <i class="fas fa-search" style="font-size: 3em; margin-bottom: 20px;"></i>
            <h3>No articles found</h3>
            <p>Try different search terms or browse all articles</p>
        `;
        blogContainer.appendChild(noResults);
        return;
    }

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
            image.src = post.imageUrls[0];
            image.alt = post.title;
            imageWrapper.appendChild(image);
        } else {
            const placeholder = document.createElement('img');
            placeholder.src = `https://placehold.co/400x180/e0e0e0/555555?text=No+Image`;
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
        const author = post.author || 'admin';
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
        readMoreBtn.href = `#post-${post.id}`;
        readMoreBtn.textContent = 'Continue Reading →';
        readMoreBtn.addEventListener('click', (event) => {
            event.preventDefault();
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
    isFullPostView = true;
    currentPostIndex = findPostIndex(post.id);

    // Update URL for deep linking
    window.location.hash = `post-${post.id}`;

    if (adminLoginButton) {
        adminLoginButton.style.opacity = '0';
        adminLoginButton.style.visibility = 'hidden';
        adminLoginButton.style.display = 'none';
    }
    
    if (searchInput) {
        searchInput.style.visibility = 'hidden';
        searchInput.style.opacity = '0';
        searchInput.disabled = true;
    }

    document.body.classList.add('full-post-active');

    blogContainer.innerHTML = '';
    blogContainer.classList.add('full-post-layout');

    // Create main content area
    const fullPostContentArea = document.createElement('div');
    fullPostContentArea.classList.add('full-post-main-content');

    // Add navigation buttons
    const postNavigation = document.createElement('div');
    postNavigation.classList.add('post-navigation');
    
    const prevButton = document.createElement('button');
    prevButton.classList.add('nav-button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
    prevButton.addEventListener('click', () => navigatePost(-1));
    postNavigation.appendChild(prevButton);
    
    const nextButton = document.createElement('button');
    nextButton.classList.add('nav-button');
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener('click', () => navigatePost(1));
    postNavigation.appendChild(nextButton);
    
    fullPostContentArea.appendChild(postNavigation);

    // --- Populate Full Post Main Content ---
    const postHeader = document.createElement('div');
    postHeader.classList.add('main-post-header');
    const title = document.createElement('h1');
    title.textContent = post.title;
    postHeader.appendChild(title);
    fullPostContentArea.appendChild(postHeader);

    const meta = document.createElement('p');
    meta.classList.add('main-post-meta');
    meta.innerHTML = `<span><i class="fas fa-user-circle"></i> ${post.author || 'admin'}</span> • <span><i class="far fa-calendar-alt"></i> ${post.createdAt ? post.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span> • <span><i class="fas fa-tag"></i> ${post.category || 'News'}</span>`;
    fullPostContentArea.appendChild(meta);

    // Add reading time
    if (post.body) {
        const readingTime = document.createElement('p');
        readingTime.classList.add('reading-time');
        const minutes = calculateReadingTime(post.body);
        readingTime.textContent = `Estimated reading time: ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        fullPostContentArea.appendChild(readingTime);
    }

    // Add share buttons
    const shareButtons = document.createElement('div');
    shareButtons.classList.add('share-buttons');
    
    const shareUrls = generateShareUrls(post);
    
    const facebookBtn = document.createElement('a');
    facebookBtn.href = shareUrls.facebook;
    facebookBtn.target = '_blank';
    facebookBtn.classList.add('share-button', 'facebook');
    facebookBtn.innerHTML = '<i class="fab fa-facebook-f"></i> Share';
    shareButtons.appendChild(facebookBtn);
    
    const twitterBtn = document.createElement('a');
    twitterBtn.href = shareUrls.twitter;
    twitterBtn.target = '_blank';
    twitterBtn.classList.add('share-button', 'twitter');
    twitterBtn.innerHTML = '<i class="fab fa-twitter"></i> Tweet';
    shareButtons.appendChild(twitterBtn);
    
    const linkedinBtn = document.createElement('a');
    linkedinBtn.href = shareUrls.linkedin;
    linkedinBtn.target = '_blank';
    linkedinBtn.classList.add('share-button', 'linkedin');
    linkedinBtn.innerHTML = '<i class="fab fa-linkedin-in"></i> Share';
    shareButtons.appendChild(linkedinBtn);
    
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = shareUrls.whatsapp;
    whatsappBtn.target = '_blank';
    whatsappBtn.classList.add('share-button', 'whatsapp');
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Share';
    shareButtons.appendChild(whatsappBtn);

    
    const copyLinkBtn = document.createElement('button');
    copyLinkBtn.classList.add('share-button');
    copyLinkBtn.innerHTML = '<i class="fas fa-link"></i> Copy Link';
    copyLinkBtn.addEventListener('click', () => copyUrlToClipboard(post));
    shareButtons.appendChild(copyLinkBtn);
    
    fullPostContentArea.appendChild(shareButtons);

    // Main Image Container
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('full-post-image-container');
        const mainImage = document.createElement('img');
        mainImage.src = post.imageUrls[0];
        mainImage.alt = post.title;
        imageContainer.appendChild(mainImage);
        fullPostContentArea.appendChild(imageContainer);
    } else {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('full-post-image-container');
        const placeholder = document.createElement('img');
        placeholder.src = `https://placehold.co/900x450/e0e0e0/555555?text=No+Main+Image`;
        placeholder.alt = "No image available";
        imageContainer.appendChild(placeholder);
        fullPostContentArea.appendChild(imageContainer);
    }

    // Other images below main image
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 1) {
        const otherImagesContainer = document.createElement('div');
        otherImagesContainer.classList.add('full-post-other-images');
        otherImagesContainer.dataset.imageCount = post.imageUrls.length -1;

        post.imageUrls.slice(1).forEach((imageUrl, index) => {
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = `Image ${index + 2}`;
            otherImagesContainer.appendChild(image);
        });
        fullPostContentArea.appendChild(otherImagesContainer);
    }

    // Headline
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

    // Embedded YouTube Videos
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

    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to All Posts';
    backButton.classList.add('full-post-back-button');
    backButton.addEventListener('click', () => {
        window.location.hash = '';
        displayPosts(allBlogPosts);
    });
    fullPostContentArea.appendChild(backButton);

    blogContainer.appendChild(fullPostContentArea);

    // Populate "You Might Also Like" section
    const youMightAlsoLikeGrid = youMightAlsoLikeSection.querySelector('.you-might-also-like-grid');
    
    const allPublishedArticlesSnapshot = await db.collection("articles")
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .get();

    const allPublishedArticles = allPublishedArticlesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }));

    const relatedNews = allPublishedArticles
        .filter(item => 
            item.id !== post.id &&
            item.category && post.category &&
            item.category.toLowerCase() === post.category.toLowerCase()
        )
        .slice(0, 2);

    if (relatedNews.length > 0) {
        relatedNews.forEach(item => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('blog-post');
            cardDiv.style.opacity = '1';
            cardDiv.style.transform = 'translateY(0)';

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
            cardDiv.addEventListener('click', (e) => { e.preventDefault(); showFullPost(item); });
            youMightAlsoLikeGrid.appendChild(cardDiv);
        });
    } else {
        youMightAlsoLikeGrid.innerHTML = '<p style="text-align: center; color: #777;">No related news found in this category.</p>';
    }
}

function fetchBlogPosts() {
    db.collection("articles")
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
            allBlogPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt
            }));
            
            // Check if we have a hash in the URL for deep linking
            if (window.location.hash && window.location.hash.startsWith('#post-')) {
                const postId = window.location.hash.substring(6);
                const post = allBlogPosts.find(p => p.id === postId);
                if (post) {
                    showFullPost(post);
                } else {
                    displayPosts(allBlogPosts);
                }
            } else {
                displayPosts(allBlogPosts);
            }
        }, (error) => {
            console.error("Error fetching blog posts:", error);
            blogContainer.textContent = "Failed to load blog posts.";
        });
}

// Search functionality with prioritization
function performSearch() {
    // Clear any existing timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to delay the search (debouncing)
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // If search is empty, show all posts
            displayPosts(allBlogPosts);
            return;
        }
        
        // Split search term into individual words
        const searchTerms = searchTerm.split(/\s+/);
        
        const filteredPosts = allBlogPosts.map(post => {
            let score = 0;
            
            // Check each search term against post properties
            searchTerms.forEach(term => {
                // Title matches (highest priority)
                if (post.title && post.title.toLowerCase().includes(term)) {
                    score += 10;
                }
                
                // Category matches (high priority)
                if (post.category && post.category.toLowerCase().includes(term)) {
                    score += 8;
                }
                
                // Headline matches (medium priority)
                if (post.headline && post.headline.toLowerCase().includes(term)) {
                    score += 6;
                }
                
                // Body/content matches (lower priority)
                if (post.body && post.body.toLowerCase().includes(term)) {
                    score += 2;
                }
                
                // Excerpt matches (low priority)
                if (post.excerpt && post.excerpt.toLowerCase().includes(term)) {
                    score += 1;
                }
            });
            
            return {
                post: post,
                score: score
            };
        }).filter(item => item.score > 0) // Only include posts with matches
          .sort((a, b) => b.score - a.score) // Sort by score (highest first)
          .map(item => item.post); // Return just the post objects
        
        displayPosts(filteredPosts);
    }, 300); // 300ms delay before performing search
}

// Set up search event listeners
function setupSearch() {
    // Input event for real-time search with debounce
    searchInput.addEventListener('input', () => {
        // Perform search with debounce
        performSearch();
    });
    
    // Enter key support
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            // Clear any pending timeout and perform search immediately
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            performSearch();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchBlogPosts();
    
    // Add event listeners
    scrollToTopBtn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleScrollToTopButton);
    window.addEventListener('hashchange', handleHashChange);
    
    // Set up search functionality
    setupSearch();
});

// Drawer functionality
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

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
    document.getElementById("progressBar").style.width = scrolled + '%';
    
    // Also update scroll to top button visibility
    toggleScrollToTopButton();
};
