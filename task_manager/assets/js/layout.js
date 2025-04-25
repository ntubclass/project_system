document.addEventListener("DOMContentLoaded", function () {
  // 側邊欄切換功能
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const header = document.querySelector('.header');
  const mainContent = document.querySelector('.main-content');

  if (menuToggle && sidebar && header && mainContent) {
      menuToggle.addEventListener('click', () => {
          sidebar.classList.toggle('sidebar-hidden');
          mainContent.classList.toggle('main-content-full');
          header.classList.toggle('header-full');
      });
  }
});