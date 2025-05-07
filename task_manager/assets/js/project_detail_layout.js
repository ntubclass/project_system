document.addEventListener("DOMContentLoaded", function () {
  // 側邊欄切換功能
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const header = document.querySelector(".header");
  const content = document.querySelector("main.content");

  // 保存側邊欄狀態到 localStorage
  function saveMenuState(isHidden) {
    localStorage.setItem("sidebarHidden", isHidden);
  }

  // 讀取側邊欄狀態
  function loadMenuState() {
    return localStorage.getItem("sidebarHidden") === "true";
  }

  // 應用側邊欄狀態
  function applyMenuState() {
    const isHidden = loadMenuState();

    if (isHidden) {
      if (sidebar) sidebar.classList.add("sidebar-hidden");
      if (header) header.classList.add("header-full");
      if (content) content.classList.add("content-full");

      // 處理主內容區
      const mainContent = document.querySelector(".project-overview-container");
      if (mainContent) {
        mainContent.classList.add("main-content-full");
      }
    }
  }

  // 初始化側邊欄狀態
  applyMenuState();

  // 直接檢查菜單按鈕
  if (!menuToggle) {
    const possibleMenuButtons = document.querySelectorAll(".menu-icon");
    if (possibleMenuButtons.length > 0) {
      // 如果找到菜單按鈕，使用第一個
      menuToggle = possibleMenuButtons[0];
    }
  }

  // 確保所有必要元素都存在
  if (menuToggle && sidebar && header) {
    // 為測試目的，先移除所有現有的點擊事件
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    
    // 添加新的點擊事件
    newMenuToggle.addEventListener("click", function(e) {
      e.preventDefault(); // 防止默認行為
      
      // 切換側邊欄的可見性
      const isHidden = sidebar.classList.toggle("sidebar-hidden");

      // 切換 header 的樣式
      header.classList.toggle("header-full");

      // 切換內容區的樣式
      if (content) {
        content.classList.toggle("content-full");
      }

      // 處理主內容區
      const mainContent = document.querySelector(".project-overview-container");
      if (mainContent) {
        mainContent.classList.toggle("main-content-full");
      }

      // 保存側邊欄狀態
      saveMenuState(isHidden);
    });
  }

  const firstButton = document.querySelector('.status-switch .switch-option');
  const slider = document.querySelector('.status-switch .slider');

  if (firstButton && slider) {
    const buttonWidth = firstButton.offsetWidth; // Get the width of the first button
    slider.style.left = `${firstButton.offsetLeft}px`; // Position the slider under the first button
    slider.style.width = `${buttonWidth}px`; // Match the slider's width to the first button
    firstButton.classList.add('active'); // Ensure the first button is active
  }

  // Add click event listeners to all buttons
  document.querySelectorAll('.status-switch .switch-option').forEach((button, index) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.status-switch .switch-option').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const buttonWidth = button.offsetWidth; // Get the width of the clicked button
      slider.style.left = `${button.offsetLeft}px`; // Position the slider based on the button's offset
      slider.style.width = `${buttonWidth}px`; // Match the slider's width to the clicked button
    });
  });
});
