const menuButton = document.getElementById('menuButton');
const closeButton = document.getElementById('closeButton');
const drawer = document.getElementById('drawer');

// Open the drawer
menuButton.addEventListener('click', () => {
    drawer.style.top = '0';
});

// Close the drawer
closeButton.addEventListener('click', () => {
    drawer.style.top = '-100%';
});
