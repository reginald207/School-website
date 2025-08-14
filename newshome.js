// **Firebase Initialization for Homepage News Loader**
// IMPORTANT: Replace these placeholder values with your ACTUAL Firebase project configuration.
// This must match the config you use for all other Firebase connections.
const firebaseConfig = {
    apiKey: "AIzaSyBxtT17hSDupMGgZeOj9f1IUScGRDFEUZc",
    authDomain: "blog-page-ab3f9.firebaseapp.com",
    projectId: "blog-page-ab3f9",
    storageBucket: "blog-page-ab3f9.firebasestorage.app",
    messagingSenderId: "368602214392",
    appId: "1:368602214392:web:d1f5d9a3d636b090b6f00d",
    measurementId: "G-0DCW1GDKZZ"                     // <-- REPLACE THIS (Optional)
};

try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully in homepage-news-loader.js");
} catch (error) {
    console.error("Error initializing Firebase app in homepage-news-loader.js:", error);
    // Display an error message on the page if Firebase init fails
    const homepageNewsContainer = document.getElementById('homepage-news-container');
    if (homepageNewsContainer) {
        homepageNewsContainer.innerHTML = '<p style="color: red; text-align: center;">Error: Could not initialize Firebase. Please check your console for details and ensure Firebase config is correct.</p>';
    }
    // Prevent further execution if Firebase isn't initialized
    throw new Error("Firebase initialization failed.");
}

// Get a reference to the Firestore database service
const db = firebase.firestore();
console.log("Firestore database reference obtained.");


// Get references to the HTML elements where news will be displayed on the homepage
const homepageNewsContainer = document.getElementById('homepage-news-container');
const loadingNewsMessage = document.getElementById('loading-news');
const noNewsFoundMessage = document.getElementById('no-news-found');

/**
 * Fetches the latest 3 published news articles from Firestore and displays them on the homepage.
 * It also handles loading and "no news found" messages.
 */
async function fetchAndDisplayLatestNews() {
    console.log("Attempting to fetch and display latest news...");

    // Basic check for essential DOM elements
    if (!homepageNewsContainer || !loadingNewsMessage || !noNewsFoundMessage) {
        console.error("Error: One or more essential news section elements not found in HTML. Check IDs: 'homepage-news-container', 'loading-news', 'no-news-found'. Cannot proceed with news display.");
        return; // Exit if elements are missing
    }

    homepageNewsContainer.innerHTML = ''; // Clear any existing static content in the container
    loadingNewsMessage.style.display = 'block'; // Show the "Loading..." message
    noNewsFoundMessage.style.display = 'none'; // Ensure "No news found" is hidden

    try {
        console.log("Querying Firestore for articles...");
        // Fetch articles from the 'articles' collection in Firestore
        // Filter by 'status' == 'published' to only show live articles
        // Order them by 'createdAt' in descending order (newest first)
        // Limit the results to the top 3 latest articles
        const snapshot = await db.collection("articles")
            .where("status", "==", "published")
            .orderBy("createdAt", "desc")
            .limit(3)
            .get();
        console.log("Firestore query completed. Snapshot received.");

        loadingNewsMessage.style.display = 'none'; // Hide the loading message once data is fetched

        // Check if any documents were returned
        if (snapshot.empty) {
            console.warn("No published articles found in Firestore 'articles' collection.");
            noNewsFoundMessage.style.display = 'block'; // Show the "No news found" message
            noNewsFoundMessage.textContent = "No latest news found. Check your Firestore data or 'published' status.";
            return; // Exit if no articles are found
        }

        console.log(`Found ${snapshot.docs.length} published articles. Rendering cards...`);
        // Iterate over each fetched document (article)
        snapshot.docs.forEach((doc, index) => {
            const article = {
                id: doc.id, // Get the document ID (useful for linking to full post)
                ...doc.data() // Get all other fields from the document
            };
            console.log(`Processing article ${index + 1}: ${article.title || 'Untitled'} (ID: ${article.id})`);

            // Create a new div element for each news card
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card'); // Apply the 'news-card' CSS class

            // Add a slight delay for each card to create a staggered fade-in animation effect
            setTimeout(() => {
                newsCard.classList.add('loaded'); // Add 'loaded' class to trigger animation
            }, index * 150); // 150ms delay between each card to make them appear one by one

            // Make the entire card clickable, linking to the full news/events page
            // The `#post-${article.id}` is an anchor that the news/events page can use
            // to potentially scroll to or highlight the specific article.
            newsCard.addEventListener('click', () => {
                console.log(`Navigating to news and events-osco.html#post-${article.id}`);
                window.location.href = `blogpage.html#post-${article.id}`;
            });

            // Determine the image URL for the card. Use the first image from imageUrls array,
            // or a placeholder if no images are available.
            const imageUrl = article.imageUrls && Array.isArray(article.imageUrls) && article.imageUrls.length > 0 ?
                             article.imageUrls[0] :
                             'https://placehold.co/400x200/e0e0e0/555555?text=No+Image'; // Generic placeholder image
            
            // Format the date
            const formattedDate = article.createdAt && article.createdAt.toDate ? 
                                  article.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 
                                  'N/A';

            // Populate the inner HTML of the news card using template literals
            newsCard.innerHTML = `
                <img src="${imageUrl}" alt="${article.title}" onerror="this.src='https://placehold.co/400x200/e0e0e0/555555?text=No+Image';">
                <div class="news-card-content">
                    <!-- Category tag, dynamically sets class based on article.category -->
                    <span class="tag ${article.category ? article.category.toLowerCase() : 'news'}">${article.category || 'NEWS'}</span>
                    <h3>${article.title}</h3>
                    <p class="news-meta">
                        <!-- Format the creation date nicely -->
                        ${formattedDate}
                    </p>
                    <!-- Display a truncated excerpt or the beginning of the body -->
                    <p class="news-excerpt">${article.excerpt || (article.body ? article.body.substring(0, 100) + '...' : 'No excerpt available.')}</p>
                    <!-- "Read More" link pointing to the full news/events page -->
                    <a href="blogpage.html#post-${article.id}" class="read-more-link">Read More &rarr;</a>
                </div>
            `;
            homepageNewsContainer.appendChild(newsCard); // Add the newly created card to the container
            console.log(`Card for '${article.title || 'Untitled'}' appended to container.`);
        });

    } catch (error) {
        console.error("Critical Error fetching or rendering latest news for homepage:", error);
        loadingNewsMessage.style.display = 'none'; // Hide loading message on error
        noNewsFoundMessage.style.display = 'block'; // Show error message
        noNewsFoundMessage.textContent = `Failed to load news due to an error: ${error.message}. Please check console for details.`; // Provide user-friendly error
    }
}

// Ensure fetching begins when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired. Calling fetchAndDisplayLatestNews().");
    fetchAndDisplayLatestNews();
});







//CTA Carousel
const slides = document.querySelectorAll('.slide');
const countdown = document.getElementById('countdown');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let currentSlide = 0;
let timer = 8;
let interval;
let countdownInterval;
let isPaused = false;

// Typewriter animation for <h1>
function typewriterEffect(h1) {
  const fullText = h1.getAttribute('data-text') || '';
  h1.textContent = '';
  h1.style.width = 'auto';
  let i = 0;

  const typing = setInterval(() => {
    if (i < fullText.length) {
      h1.textContent += fullText.charAt(i);
      i++;
    } else {
      clearInterval(typing);
      const p = h1.nextElementSibling;
      if (p) {
        p.style.animation = 'fadeinText 1.5s ease forwards';
      }
    }
  }, 100);
}

// Show a specific slide
function goToSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) {
      slide.classList.add('active');

      const h1 = slide.querySelector('h1');
      const p = slide.querySelector('p');
      if (h1) {
        h1.textContent = '';
        p.style.opacity = 0;
        typewriterEffect(h1);
      }
    }
  });
}

// Move to next/prev slide
function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  goToSlide(currentSlide);
  resetCountdown();
}
function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  goToSlide(currentSlide);
  resetCountdown();
}

// Auto-slide every 8 seconds
function startAutoSlide() {
  interval = setInterval(() => {
    if (!isPaused) nextSlide();
  }, 8000);
}

// Countdown display
function startCountdown() {
  countdown.textContent = timer;
  countdownInterval = setInterval(() => {
    if (!isPaused) {
      timer--;
      countdown.textContent = timer;
      if (timer <= 0) {
        timer = 8;
        countdown.textContent = timer;
      }
    }
  }, 1000);
}

// Reset countdown on manual nav
function resetCountdown() {
  clearInterval(countdownInterval);
  timer = 8;
  countdown.textContent = timer;
  startCountdown();
}

// Pause on hover
document.getElementById('carousel').addEventListener('mouseenter', () => isPaused = true);
document.getElementById('carousel').addEventListener('mouseleave', () => isPaused = false);

// Button events
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Swipe events (mobile)
let touchStartX = 0;
let touchEndX = 0;
document.getElementById('carousel').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});
document.getElementById('carousel').addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  if (touchEndX < touchStartX - 50) nextSlide();
  if (touchEndX > touchStartX + 50) prevSlide();
});

// Start everything
goToSlide(currentSlide);
startAutoSlide();
startCountdown();
