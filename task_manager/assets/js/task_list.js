class TaskRenderer {
  constructor(options = {}) {
    // Target element for rendering tasks
    this.container =
      typeof options.container === "string"
        ? document.querySelector(options.container)
        : options.container || document.getElementById("mainContent");

    // Check if container exists
    if (!this.container) {
      return; // Exit constructor if container is not found
    }

    // Debug container for showing task data
    this.debugContainer = options.debugContainer || null;

    // Initialize if task data is provided
    if (options.tasks) {
      // Add debug output
      if (this.debugContainer) {
        this.debugContainer.innerHTML = `<pre>Task data: ${JSON.stringify(
          options.tasks,
          null,
          2
        )}</pre>`;
      }

      this.renderTasks(options.tasks);
    } else {
      this.container.innerHTML =
        '<div class="no-tasks-message">No tasks provided</div>';
    }
  }

  /**
   * Find elements in the DOM by query selector
   * @param {string} query - CSS query selector
   * @returns {NodeList} - Matching DOM elements
   */
  findByQuery(query) {
    if (!this.container) return [];
    return this.container.querySelectorAll(query);
  }

  /**
   * Render tasks from API data
   * @param {Array} tasks - Array of task objects
   */
  renderTasks(tasks) {
    // Check if container exists before attempting to render
    if (!this.container) {
      return;
    }

    if (!tasks || !tasks.length) {
      this.container.innerHTML =
        '<div class="no-tasks-message">No tasks found</div>';
      return;
    }

    // Split into different categories based on status property
    const notStartedTasks = tasks.filter(
      (task) => task.status === "not-started"
    );
    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    );
    const completedTasks = tasks.filter((task) => task.status === "completed");
    const overdueTasks = tasks.filter((task) => task.status === "overdue");

    // Generate HTML with category section at the top
    const html = `
          <!-- Category summary cards -->
          <div class="category-section">
            <div class="category-cards">
                <div class="category-card" data-category="not_started">
                    <div class="category-info">
                        <div class="category-title">未開始任務</div>
                        <div class="category-count">${
                          notStartedTasks.length
                        }</div>
                    </div>
                </div>
                <div class="category-card" data-category="in_progress">
                    <div class="category-info">
                        <div class="category-title">進行中任務</div>
                        <div class="category-count">${
                          inProgressTasks.length
                        }</div>
                    </div>
                </div>
                <div class="category-card" data-category="overdue">
                    <div class="category-info">
                        <div class="category-title">逾時任務</div>
                        <div class="category-count">${overdueTasks.length}</div>
                    </div>
                </div>
                <div class="category-card" data-category="completed">
                    <div class="category-info">
                        <div class="category-title">已完成任務</div>
                        <div class="category-count">${
                          completedTasks.length
                        }</div>
                    </div>
                </div>
            </div>
          </div>
          
          <!-- Task sections -->
          <div class="task-section" data-section-type="not_started">
              <div class="section-header">
                  <div class="section-title">
                      <i class="section-icon not-started fas fa-caret-down"></i>
                      <span class="status not-started">未開始</span>
                  </div>
                  <div class="task-count not-started">${
                    notStartedTasks.length
                  }</div>
              </div>
              <div class="task-cards">
                  ${notStartedTasks
                    .map((task) => this.createTaskCardHTML(task))
                    .join("")}
              </div>
          </div>
          
          <div class="task-section" data-section-type="in-progress">
              <div class="section-header">
                  <div class="section-title">
                      <i class="section-icon in-progress fas fa-caret-down"></i>
                      <span class="status in-progress">進行中任務</span>
                  </div>
                  <div class="task-count in-progress">${
                    inProgressTasks.length
                  }</div>
              </div>
              <div class="task-cards">
                  ${inProgressTasks
                    .map((task) => this.createTaskCardHTML(task))
                    .join("")}
              </div>
          </div>
          
          <div class="task-section" data-section-type="overdue">
              <div class="section-header">
                  <div class="section-title">
                      <i class="section-icon overdue fas fa-caret-down"></i>
                      <span class="status overdue">逾時任務</span>
                  </div>
                  <div class="task-count overdue">${overdueTasks.length}</div>
              </div>
              <div class="task-cards">
                  ${overdueTasks
                    .map((task) => this.createTaskCardHTML(task))
                    .join("")}
              </div>
          </div>
          
          <div class="task-section" data-section-type="completed">
              <div class="section-header">
                  <div class="section-title">
                      <i class="section-icon completed fas fa-caret-down"></i>
                      <span class="status completed">已完成任務</span>
                  </div>
                  <div class="task-count completed">${
                    completedTasks.length
                  }</div>
              </div>
              <div class="task-cards">
                  ${completedTasks
                    .map((task) => this.createTaskCardHTML(task))
                    .join("")}
              </div>
          </div>
      `;

    this.container.innerHTML = html;

    // Add click handlers for section headers
    this.addSectionToggleHandlers();

    // Add click handlers for category cards
    this.addCategoryCardHandlers();

    // Initialize progress bars
    this.initProgressBars();
  }

  /**
   * Create HTML for a task card
   * @param {Object} task - Task data
   * @returns {string} - HTML string
   */
  createTaskCardHTML(task) {
    const taskId = task.id || task.task_id;
    if (!taskId) {
      return "";
    }

    const status = task.status || "";
    const isOverdue = status === "overdue";
    const progress = task.progress || 0;
    const projectName = task.project_name || "";

    const dateLabel = "截止日期";
    const dateValue = task.end_date;
    let dateFormatted = "未設定";

    try {
      if (dateValue) {
        dateFormatted =
          typeof dateValue === "string"
            ? dateValue.split(" ")[0]
            : dateValue.toISOString().split("T")[0];
      }
    } catch (e) {
      // Silent error handling
    }

    // Create avatar stack HTML
    let avatarStackHTML = "";
    if (task.member_avatars && task.member_avatars.length > 0) {
      const ownerAvatar =
        task.user_avatar || task.photo || "default-avatar.png";
      const memberAvatars = task.member_avatars || [];

      avatarStackHTML = `
        <div class="user-avatar">
          <div class="avatar-stack">
            <!-- Display task owner avatar -->
            <img src="${ownerAvatar}" class="avatar">
            
            <!-- Display up to 2 additional member avatars -->
            ${memberAvatars
              .slice(1, 3)
              .map((avatar) => `<img src="${avatar}" class="avatar">`)
              .join("")}
            
            <!-- Display member count -->
            <div class="avatar-count">${task.member_count || 1}</div>
          </div>
        </div>
      `;
    } else {
      // Fallback to single avatar if no member_avatars
      avatarStackHTML = `
        <div class="user-avatar">
          <img src="${
            task.photo || task.user_avatar || "default-avatar.png"
          }" alt="User Avatar" class="avatar">
        </div>
      `;
    }

    return `
        <div class="task-card ${status}" data-task-id="${taskId}">
            <div class="task-info">
                <div class="task-title">${task.name || task.task_name}</div>
                ${
                  projectName
                    ? `<div class="project-name">${projectName}</div>`
                    : ""
                }
                <span class="status ${status}"></span>
            </div>
            <div class="progress-container">
                <div class="progress-label">進度</div>
                <div class="progress-percentage">${task.progress}%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${isOverdue ? "overdue" : ""}" 
                     style="width: ${task.progress}%" 
                     progress="${task.progress}">
                </div>
            </div>
            <div class="card-info">
              ${avatarStackHTML}
              <div class="task-due-date ${isOverdue ? "overdue" : ""}">
                  <i class="date-icon far fa-calendar"></i>
                  ${dateLabel}：${dateFormatted}
              </div>
            </div>
        </div>
    `;
  }
  /**
   * Initialize and set up progress bars
   */
  initProgressBars() {
    const progressBars = this.findByQuery(".progress-fill");
    progressBars.forEach((bar) => {
      // 獲取progress屬性值
      const progressValue = bar.getAttribute("progress"); // 如果存在progress屬性，則重新設置動畫
      if (progressValue) {
        // 先移除transition，設置初始寬度為0
        bar.style.transition = "none";
        bar.style.width = "0%";

        // 強制瀏覽器重新計算樣式
        bar.offsetWidth;

        // 使用 setTimeout 讓瀏覽器完成初始渲染後再開始動畫
        setTimeout(() => {
          // 重新添加transition並設置進度條寬度，觸發動畫
          bar.style.transition = "width 0.3s ease";
          bar.style.width = `${progressValue}%`;
        }, 50); // 50ms 延遲確保DOM完全就緒

        // 找到對應的百分比顯示元素並更新
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
            // 延遲更新百分比顯示，讓動畫更自然
            setTimeout(() => {
              percentageDisplay.textContent = `${progressValue}%`;
            }, 100);
          }
        }
      }
    });
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
          taskCards.style.display === "none" ? "grid" : "none";

        // Toggle icon
        const icon = header.querySelector(".section-icon");
        icon.classList.toggle("fa-caret-down");
        icon.classList.toggle("fa-caret-right");
      });
    });
  }

  /**
   * Add handlers for category card clicks
   */
  addCategoryCardHandlers() {
    const categoryCards = this.findByQuery(".category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", () => {
        // Remove active class from all cards
        categoryCards.forEach((c) => c.classList.remove("active"));

        // Add active class to clicked card
        card.classList.add("active");
      });
    });

    // Set first category card as active by default
    if (categoryCards.length > 0) {
      categoryCards[0].classList.add("active");
    }
  }

  /**
   * Update progress for a specific task
   * @param {string|number} taskId - ID of the task to update
   * @param {number} progress - New progress value (0-100)
   * @param {string} status - Optional new status
   */
  updateTaskProgress(taskId, progress, status) {
    // Find the task card
    const taskCard = this.findByQuery(`[data-task-id="${taskId}"]`)[0];
    if (!taskCard) return;

    // Update the progress display
    const progressPercentage = taskCard.querySelector(".progress-percentage");
    if (progressPercentage) {
      progressPercentage.textContent = `${progress}%`;
    }

    // Update the progress bar
    const progressFill = taskCard.querySelector(".progress-fill");
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
      progressFill.setAttribute("progress", progress);
    }

    // Update status if provided
    if (status) {
      const statusElement = taskCard.querySelector(".status");
      if (statusElement) {
        // Remove all existing status classes
        statusElement.classList.remove(
          "not-started",
          "in-progress",
          "overdue",
          "completed"
        );
        // Add the new status class
        statusElement.classList.add(status);
      }

      // Update the task card status class as well
      taskCard.classList.remove(
        "not-started",
        "in-progress",
        "overdue",
        "completed"
      );
      taskCard.classList.add(status);
    }
  }
}

// Add auto-initialization if the page includes task data
document.addEventListener("DOMContentLoaded", function () {
  // Check for task data in the global scope or in a data attribute
  const taskData = window.taskData || [];

  // Make sure the container exists before initializing
  const container = document.getElementById("mainContent");

  if (!container) {
    // Try an alternative container
    const altContainer =
      document.querySelector(".task-container") ||
      document.querySelector("main") ||
      document.body;

    if (altContainer) {
      // Create a new div to serve as mainContent
      const newMainContent = document.createElement("div");
      newMainContent.id = "mainContent";
      altContainer.appendChild(newMainContent);
    } else {
      return;
    }
  }

  // If we have data in the page, initialize the renderer
  if (taskData.length) {
    new TaskRenderer({
      container: container,
      tasks: taskData,
    });
  } else {
    // Try to find tasks in the context
    const myTasks = window.myTasks || [];
    const participateTasks = window.participateTasks || [];

    if (myTasks.length || participateTasks.length) {
      try {
        new TaskRenderer({
          container: container,
          tasks: [...myTasks, ...participateTasks],
        });
      } catch (error) {
        // Silent error handling
      }
    }
  }
});
