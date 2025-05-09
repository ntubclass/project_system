class TaskRenderer {
  constructor(options = {}) {
    // Target element for rendering tasks
    this.container =
      typeof options.container === "string"
        ? document.querySelector(options.container)
        : options.container || document.getElementById("mainContent");

    // Initialize if task data is provided
    if (options.tasks) {
      this.renderTasks(options.tasks);
    }
  }

  /**
   * Find elements in the DOM by query selector
   * @param {string} query - CSS query selector
   * @returns {NodeList} - Matching DOM elements
   */
  findByQuery(query) {
    return this.container.querySelectorAll(query);
  }

  /**
   * Check if a task is completed
   * @param {Object} task - Task data
   * @returns {boolean} - True if task is completed
   */
  isTaskCompleted(task) {
    return (
      task.progress >= 100 ||
      task.status === "completed" ||
      (task.end_date && new Date(task.end_date) < new Date())
    );
  }

  /**
   * Render tasks from API data
   * @param {Array} tasks - Array of task objects
   */
  renderTasks(tasks) {
    if (!tasks || !tasks.length) {
      this.container.innerHTML =
        '<div class="no-tasks-message">No tasks found</div>';
      return;
    }

    // Split into in-progress and completed tasks
    const inProgressTasks = [];
    const completedTasks = [];

    tasks.forEach((task) => {
      if (this.isTaskCompleted(task)) {
        completedTasks.push(task);
      } else {
        inProgressTasks.push(task);
      }
    });

    // Generate HTML
    const html = `
          <div class="task-section" data-section-type="continue">
              <div class="section-header">
                  <div class="section-title">
                      <i class="section-icon continue fas fa-caret-down"></i>
                      進行中任務
                  </div>
                  <div class="task-count continue">${
                    inProgressTasks.length
                  }</div>
              </div>
              <div class="task-cards">
                  ${inProgressTasks
                    .map((task) => this.createTaskCardHTML(task, false))
                    .join("")}
              </div>
          </div>
          <div class="task-section" data-section-type="completed">
              <div class="section-header">
                  <div class="section-title">
                      <i class="section-icon completed fas fa-caret-down"></i>
                      已完成任務
                  </div>
                  <div class="task-count completed">${
                    completedTasks.length
                  }</div>
              </div>
              <div class="task-cards">
                  ${completedTasks
                    .map((task) => this.createTaskCardHTML(task, true))
                    .join("")}
              </div>
          </div>
      `;

    this.container.innerHTML = html;

    // Add click handlers for section headers
    this.addSectionToggleHandlers();
  }

  /**
   * Create HTML for a task card
   * @param {Object} task - Task data
   * @param {boolean} isCompleted - Whether the task is completed
   * @returns {string} - HTML string
   */
  createTaskCardHTML(task, isCompleted) {
    const taskId = task.id;

    const dateLabel = isCompleted ? "完成日期" : "截止日期";
    const dateValue = task.end_date;
    const dateFormatted = dateValue ? dateValue.split(" ")[0] : "No date";

    return `
          <div class="task-card" data-task-id="${taskId}">
              <div class="task-info">
                  <div class="task-title">${task.name}</div>
                  <div class="project-name">${task.project_name}</div>
              </div>
              <div class="progress-container">
                  <div class="progress-label">進度</div>
                  <div class="progress-percentage">${task.progress}%</div>
              </div>
              <div class="progress-bar">
                  <div class="progress-fill" style="width: ${task.progress}%"></div>
              </div>
              <div class="task-due-date">
                  <i class="date-icon far fa-calendar"></i>
                  ${dateLabel}：${dateFormatted}
              </div>
          </div>
      `;
  }

  /**
   * Add handlers for section toggle
   */
  addSectionToggleHandlers() {
    const sectionHeaders = this.findByQuery(".section-header");
    sectionHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const taskCards = header.nextElementSibling;
        taskCards.style.display =
          taskCards.style.display === "none" ? "flex" : "none";

        // Toggle icon
        const icon = header.querySelector(".section-icon");
        icon.classList.toggle("fa-caret-down");
        icon.classList.toggle("fa-caret-right");
      });
    });
  }
}

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

  // 任務區段摺疊/展開
  const sectionHeaders = document.querySelectorAll(".section-header");
  sectionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const section = header.parentElement;
      const taskCards = section.querySelector(".task-cards");
      const icon = header.querySelector(".section-icon");

      if (taskCards.style.display === "none") {
        taskCards.style.display = "grid";
        icon.classList.remove("fa-caret-right");
        icon.classList.add("fa-caret-down");
      } else {
        taskCards.style.display = "none";
        icon.classList.remove("fa-caret-down");
        icon.classList.add("fa-caret-right");
      }
    });
  });

  // 設置任務進度條 - 類似 project.js 的方式
  const progressBars = document.querySelectorAll(".progress-fill");
  progressBars.forEach((bar) => {
    // 取得已設定的 width 百分比 (如果直接在 style 中設定)
    const style = window.getComputedStyle(bar);
    const width = style.width;
    const parentWidth = window.getComputedStyle(bar.parentElement).width;

    // 計算進度百分比
    let progressValue = (parseInt(width) / parseInt(parentWidth)) * 100;

    // 如果沒有通過 style 直接設定，檢查是否有 progress 屬性
    if (isNaN(progressValue) && bar.hasAttribute("progress")) {
      progressValue = bar.getAttribute("progress");
    }

    // 若進度值存在，更新相應的進度文字
    if (progressValue) {
      const progressBarContainer = bar.closest(".progress-bar");
      const progressContainer = progressBarContainer.previousElementSibling;

      if (
        progressContainer &&
        progressContainer.classList.contains("progress-container")
      ) {
        const percentageDisplay = progressContainer.querySelector(
          ".progress-percentage"
        );
        if (percentageDisplay) {
          percentageDisplay.textContent = `${progressValue}%`;
        }
      }
    }
  });
});
