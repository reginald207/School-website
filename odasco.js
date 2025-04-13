document.addEventListener('DOMContentLoaded', function() {
    var sideDrawer = document.getElementById('side-drawer');
    var menuToggle = document.getElementById('menu-toggle');
    var closeBtn = document.getElementById('close-btn');
  
    menuToggle.addEventListener('click', function() {
        sideDrawer.classList.toggle('open');
    });
  
    closeBtn.addEventListener('click', function() {
        sideDrawer.classList.remove('open');
    });
  });
  
  
  // Add animation to hero section
  const hero = document.getElementById('hero');
  hero.animate([
  { opacity: 0 },
  { opacity: 1 }
  ], {
  duration: 1000,
  fill: 'forwards'
  });s