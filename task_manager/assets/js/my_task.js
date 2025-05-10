document.addEventListener("DOMContentLoaded", function () {
  const sampleTasks = [
    {
      id: 1,
      name: "設計使用者介面",
      project_name: "專案A - 網站改版",
      progress: 75,
      start_date: "2025-04-01 09:00:00",
      end_date: "2025-05-15 18:00:00",
      status: "in_progress",
    },
    {
      id: 2,
      name: "後端API開發",
      project_name: "專案A - 網站改版",
      progress: 60,
      start_date: "2025-04-05 09:00:00",
      end_date: "2025-05-20 18:00:00",
      status: "in_progress",
    },
    {
      id: 3,
      name: "資料庫設計",
      project_name: "專案B - 行動應用",
      progress: 100,
      start_date: "2025-03-15 09:00:00",
      end_date: "2025-04-10 18:00:00",
      status: "completed",
    },
    {
      id: 4,
      name: "使用者測試",
      project_name: "專案A - 網站改版",
      progress: 25,
      start_date: "2025-05-01 09:00:00",
      end_date: "2025-05-30 18:00:00",
      status: "in_progress",
    },
    {
      id: 5,
      name: "架構規劃",
      project_name: "專案C - 新系統",
      progress: 100,
      start_date: "2025-02-10 09:00:00",
      end_date: "2025-03-01 18:00:00",
      status: "completed",
    },
    {
      id: 6,
      name: "功能優化",
      project_name: "專案B - 行動應用",
      progress: 40,
      start_date: "2025-05-01 09:00:00",
      end_date: "2025-06-15 18:00:00",
      status: "in_progress",
    },
    {
      id: 7,
      name: "需求分析",
      project_name: "專案C - 新系統",
      progress: 100,
      start_date: "2025-01-15 09:00:00",
      end_date: "2025-02-05 18:00:00",
      status: "completed",
    },
  ];

  const taskRenderer = new TaskRenderer({
    container: "#taskList",
    tasks: sampleTasks,
  });
  // 視圖按鈕切換
  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
  const firstButton = document.querySelector(".status-switch .switch-option");
  const slider = document.querySelector(".status-switch .slider");

  if (firstButton && slider) {
    const buttonWidth = firstButton.offsetWidth; // Get the width of the first button
    slider.style.left = `${firstButton.offsetLeft}px`; // Position the slider under the first button
    slider.style.width = `${buttonWidth}px`; // Match the slider's width to the first button
    firstButton.classList.add("active"); // Ensure the first button is active
  }

  // Add click event listeners to all buttons
  document
    .querySelectorAll(".status-switch .switch-option")
    .forEach((button, index) => {
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".status-switch .switch-option")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        const buttonWidth = button.offsetWidth; // Get the width of the clicked button
        slider.style.left = `${button.offsetLeft}px`; // Position the slider based on the button's offset
        slider.style.width = `${buttonWidth}px`; // Match the slider's width to the clicked button
      });
    });
});
