document.addEventListener("DOMContentLoaded", function () {
  // 側邊欄切換功能
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const header = document.querySelector('.header');
  
  if (menuToggle && sidebar && header) {
    menuToggle.addEventListener('click', function() {
      // 切換側邊欄的可見性
      sidebar.classList.toggle('sidebar-hidden');
      
      // 切換 header 的樣式
      header.classList.toggle('header-full');
      
      // 處理主內容區 - 對於 task_list 頁面和 project 頁面的內容區
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.toggle('main-content-full');
        console.log('Main content class toggled');
      }
      
      // 處理 base.html 的 content 容器
      const contentContainer = document.querySelector('main.content');
      if (contentContainer) {
        contentContainer.classList.toggle('content-full');
      }
      
      // 處理 task 頁面特定容器
      const taskContainer = document.querySelector('.task');
      if (taskContainer) {
        taskContainer.classList.toggle('task-full');
      }
      
      // 處理 project 頁面特定容器
      const projectContainer = document.querySelector('.project');
      if (projectContainer) {
        projectContainer.classList.toggle('project-full');
      }
    });
  } else {
    console.warn('Menu toggle, sidebar, or header elements not found');
  }
  
  // 處理側邊欄項目的點擊事件
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  
  // 根據當前頁面URL設置活動項目
  const currentPath = window.location.pathname;
  sidebarItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPath.includes(href.replace('/', ''))) {
      item.classList.add('active');
    }
  });
});