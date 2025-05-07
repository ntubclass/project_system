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
});