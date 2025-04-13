




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






/// carousel ///
const track = document.querySelector('.carousel-track');
    const items = Array.from(track.children);
    const dots = Array.from(document.querySelectorAll('.carousel-dot'));
    const leftArrow = document.querySelector('.carousel-arrow.left');
    const rightArrow = document.querySelector('.carousel-arrow.right');

    let currentIndex = 0;

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function moveToNextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    }

    // Auto-slide functionality
    let autoSlide = setInterval(moveToNextSlide, 5000); // Change slide every 5 seconds

    rightArrow.addEventListener('click', () => {
        clearInterval(autoSlide);
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
        autoSlide = setInterval(moveToNextSlide, 5000);
    });

    leftArrow.addEventListener('click', () => {
        clearInterval(autoSlide);
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
        autoSlide = setInterval(moveToNextSlide, 5000);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(autoSlide);
            currentIndex = index;
            updateCarousel();
            autoSlide = setInterval(moveToNextSlide, 5000);
        });
    });




    




    



