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


        





// search functionality

 // Redirect to the search page when the search button is clicked
document.getElementById('searchButton').addEventListener('click', () => {
  window.location.href = '/search.html'; // Update the path to the actual search page file
});







const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const closeBtn = lightbox.querySelector('.close-btn');
const arrowLeft = lightbox.querySelector('.arrow-left');
const arrowRight = lightbox.querySelector('.arrow-right');
let currentIndex = 0;

// Open the lightbox with the clicked image
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentIndex = index;
        const imgSrc = item.querySelector('img').src;
        lightboxImage.src = imgSrc;
        lightbox.style.display = 'flex';
    });
});

// Close the lightbox
closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

// Navigate to the previous image
arrowLeft.addEventListener('click', () => {
    currentIndex = (currentIndex === 0) ? galleryItems.length - 1 : currentIndex - 1;
    lightboxImage.src = galleryItems[currentIndex].querySelector('img').src;
});

// Navigate to the next image
arrowRight.addEventListener('click', () => {
    currentIndex = (currentIndex === galleryItems.length - 1) ? 0 : currentIndex + 1;
    lightboxImage.src = galleryItems[currentIndex].querySelector('img').src;
});