 // Toggle sidebar visibility
 const menuToggle = document.getElementById('menuToggle');
 const sidebar = document.getElementById('sidebar');
 const mainContent = document.getElementById('mainContent');
 const header = document.querySelector('.header');
 
 menuToggle.addEventListener('click', () => {
     sidebar.classList.toggle('sidebar-hidden');
     mainContent.classList.toggle('main-content-full');
     header.classList.toggle('header-full'); 
 });