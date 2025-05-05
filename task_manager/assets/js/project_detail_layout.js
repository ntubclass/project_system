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
      sidebar.classList.add("hidden");
      header.classList.add("header-full");
      content.classList.add("content-full");

      // 處理主內容區
      const mainContent = document.querySelector(".project-overview-container");
      if (mainContent) {
        mainContent.classList.add("main-content-full");
      }
    }
  }

  // 初始化側邊欄狀態
  applyMenuState();

  if (menuToggle && sidebar && header) {
    menuToggle.addEventListener("click", function () {
      // 切換側邊欄的可見性
      const isHidden = sidebar.classList.toggle("hidden");

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

      // 調試輸出
      // console.log('Menu toggle clicked. Sidebar hidden:', isHidden);
    });
  } else {
    console.warn("Menu toggle, sidebar, or header elements not found");
    console.log("menuToggle:", menuToggle);
    console.log("sidebar:", sidebar);
    console.log("header:", header);
  }
});
