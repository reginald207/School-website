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
let allBlogPosts = []; // To store fetched posts
let currentDisplayedPosts = []; // To store posts currently displayed

function displayPosts(postsToDisplay) {
    blogContainer.innerHTML = ''; // Clear previous posts
    postsToDisplay.forEach((post, index) => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('blog-post');
        setTimeout(() => {
            postDiv.classList.add('loaded');
        }, index * 100);

        const imgContainer = document.createElement('div'); // Container for image and text
        imgContainer.style.display = 'flex';
        imgContainer.style.alignItems = 'flex-start'; // Align image and text to the top

        if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
            const image = document.createElement('img');
            image.src = post.imageUrls[0]; // Display the first image in the excerpt view
            image.style.maxWidth = '30%'; /* Adjust this percentage as needed */
            image.style.height = 'auto';
            image.style.marginRight = '15px';
            imgContainer.appendChild(image);
        }

        const textContent = document.createElement('div');
        textContent.style.flexGrow = '1'; // Allow text to take remaining space

        const title = document.createElement('h2');
        title.textContent = post.title;
        textContent.appendChild(title);

        const meta = document.createElement('p');
        meta.classList.add('post-meta');
        meta.textContent = `${post.createdAt ? post.createdAt.toDate().toLocaleDateString() : 'N/A'} | Category: ${post.category || 'General'}`;
        textContent.appendChild(meta);

        const excerpt = document.createElement('p');
        excerpt.textContent = post.excerpt || (post.body ? post.body.substring(0, 150) + '...' : '');
        textContent.appendChild(excerpt);

        const readMoreBtn = document.createElement('a');
        readMoreBtn.classList.add('read-more-btn');
        readMoreBtn.href = `#post-${post.id}`; // Basic in-page linking
        readMoreBtn.textContent = 'Read More';
        readMoreBtn.addEventListener('click', () => showFullPost(post));
        textContent.appendChild(readMoreBtn);

        imgContainer.appendChild(textContent);
        postDiv.appendChild(imgContainer);
        blogContainer.appendChild(postDiv);
    });
    currentDisplayedPosts = postsToDisplay;
}

function showFullPost(post) {
    console.log("showFullPost function called for post:", post);

    blogContainer.innerHTML = '';
    const fullPostDiv = document.createElement('div');
    fullPostDiv.classList.add('blog-post', 'full-post', 'loaded');

    const title = document.createElement('h2');
    title.textContent = post.title;
    fullPostDiv.appendChild(title);

    const meta = document.createElement('p');
    meta.classList.add('post-meta');
    meta.textContent = `${post.createdAt ? post.createdAt.toDate().toLocaleDateString() : 'N/A'} | Category: ${post.category || 'General'}`;
    fullPostDiv.appendChild(meta);

    // Share Buttons Container
    const shareContainer = document.createElement('div');
    shareContainer.classList.add('share-buttons');

    // Facebook Share Button
    const facebookShare = document.createElement('a');
    facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    facebookShare.target = '_blank';
    facebookShare.rel = 'noopener noreferrer';
    facebookShare.textContent = 'Facebook';
    shareContainer.appendChild(facebookShare);

    // Twitter Share Button
    const twitterShare = document.createElement('a');
    twitterShare.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`;
    twitterShare.target = '_blank';
    twitterShare.rel = 'noopener noreferrer';
    twitterShare.textContent = 'Twitter';
    shareContainer.appendChild(twitterShare);

    // LinkedIn Share Button
    const linkedinShare = document.createElement('a');
    linkedinShare.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.excerpt || (post.body ? post.body.substring(0, 150) + '...' : ''))}&source=${encodeURIComponent(window.location.origin)}`;
    linkedinShare.target = '_blank';
    linkedinShare.rel = 'noopener noreferrer';
    linkedinShare.textContent = 'LinkedIn';
    shareContainer.appendChild(linkedinShare);

    // WhatsApp Share Button (for mobile)
    const whatsappShare = document.createElement('a');
    whatsappShare.href = `whatsapp://send?text=${encodeURIComponent(`${post.title} ${window.location.href}`)}`;
    whatsappShare.setAttribute('data-action', 'share/whatsapp/share');
    whatsappShare.target = '_blank';
    whatsappShare.rel = 'noopener noreferrer';
    whatsappShare.textContent = 'WhatsApp';
    shareContainer.appendChild(whatsappShare);

    // Copy Link Button
    const copyLinkButton = document.createElement('button');
    copyLinkButton.textContent = 'Copy Link';
    copyLinkButton.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                alert('Link copied to clipboard!'); // Provide feedback
            })
            .catch(err => { // Corrected the catch syntax
                console.error('Failed to copy link: ', err);
                alert('Failed to copy link.');
            });
    });
    shareContainer.appendChild(copyLinkButton);

    fullPostDiv.appendChild(shareContainer);

    // Display images
    let imagesContainer;
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
        imagesContainer = document.createElement('div');
        imagesContainer.classList.add('full-post-images');
        imagesContainer.dataset.imageCount = post.imageUrls.length; // Store the image count

        post.imageUrls.forEach((imageUrl, index) => {
            const image = document.createElement('img');
            image.src = imageUrl;
            imagesContainer.appendChild(image);
            console.log("Full Post Image URL:", imageUrl, "Index:", index);
        });
        fullPostDiv.appendChild(imagesContainer);
    } else {
        console.log("No image URLs found for this post.");
    }

    // Display the headline below the images
    if (post.headline) {
        const headlineElement = document.createElement('h3');
        headlineElement.classList.add('post-headline');
        headlineElement.textContent = post.headline;
        fullPostDiv.appendChild(headlineElement);
    }

    // Add the article body
    const fullText = document.createElement('div');
    fullText.classList.add('full-post-text');
    fullText.innerHTML = post.body || '';
    console.log("Full post body:", post.body);
    fullPostDiv.appendChild(fullText);

    // Embed YouTube videos
    if (post.videoUrls && Array.isArray(post.videoUrls) && post.videoUrls.length > 0) {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('full-post-videos');
        videoContainer.dataset.videoCount = post.videoUrls.length; // Store the video count
        post.videoUrls.forEach(videoUrl => {
            let videoId = null;
            const regularMatch = videoUrl.match(/[?&]v=([^&]+)/);
            if (regularMatch && regularMatch[1]) videoId = regularMatch[1];
            const shortMatch = videoUrl.match(/youtu\.be\/([^?&]+)/);
            if (shortMatch && shortMatch[1]) videoId = shortMatch[1];

            if (videoId) {
                const embedUrl = `http://www.youtube.com/embed/${videoId}`; // Corrected embed URL format
                const iframe = document.createElement('iframe');
                iframe.width = '560';
                iframe.height = '315';
                iframe.src = embedUrl;
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                videoContainer.appendChild(iframe);
                console.log("Embedded YouTube video:", videoUrl, "ID:", videoId, "Embed URL:", embedUrl);
            } else {
                console.log("Invalid YouTube URL:", videoUrl);
                const message = document.createElement('p');
                message.textContent = `Invalid YouTube link: ${videoUrl}`;
                videoContainer.appendChild(message);
            }
        });
        fullPostDiv.appendChild(videoContainer);
    } else {
        console.log("No video URLs found for this post.");
    }

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to All Posts';
    backButton.addEventListener('click', () => displayPosts(allBlogPosts));
    fullPostDiv.appendChild(backButton);

    blogContainer.appendChild(fullPostDiv);
}

function fetchBlogPosts() {
    db.collection("articles")
        .where("status", "==", "published") // Only fetch published posts for the blog
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
            allBlogPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            displayPosts(allBlogPosts);
        }, (error) => {
            console.error("Error fetching blog posts:", error);
            blogContainer.textContent = "Failed to load blog posts.";
        });
}

// Basic search functionality (now uses fetched data)
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredPosts = allBlogPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        (post.body && post.body.toLowerCase().includes(searchTerm)) ||
        (post.headline && post.headline.toLowerCase().includes(searchTerm)) ||
        (post.category && post.category.toLowerCase().includes(searchTerm))
    );
    displayPosts(filteredPosts);
});

document.addEventListener('DOMContentLoaded', () => {
    fetchBlogPosts();
});

// You would need to add more JavaScript for other features like
// category filtering (you can fetch categories from Firestore or filter client-side),
// comment sections (requiring Firestore and user authentication),
// social sharing (using third-party APIs or libraries), etc.



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






