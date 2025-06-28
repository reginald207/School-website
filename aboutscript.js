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


        

const galleryImages = document.querySelectorAll(".gallery-item img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeBtn = document.getElementById("closeBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let currentIndex = 0;

    function showImage(index) {
      const img = galleryImages[index];
      lightboxImg.src = img.src;
      currentIndex = index;
      lightbox.classList.add("show");
    }

    galleryImages.forEach((img, index) => {
      img.addEventListener("click", () => showImage(index));
    });

    closeBtn.addEventListener("click", () => {
      lightbox.classList.remove("show");
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % galleryImages.length;
      showImage(currentIndex);
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      showImage(currentIndex);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") lightbox.classList.remove("show");
      if (e.key === "ArrowRight") nextBtn.click();
      if (e.key === "ArrowLeft") prevBtn.click();
    });

    // Swipe for mobile
    let startX = 0;

    lightbox.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    lightbox.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (diff > 50) {
        nextBtn.click(); // swipe left
      } else if (diff < -50) {
        prevBtn.click(); // swipe right
      }
    });
