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
    return task.progress >= 100;
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

    // Generate HTML with category section at the top
    const html = `
          <!-- Category summary cards -->
          <div class="category-section">
            <div class="category-cards">
                <div class="category-card" data-category="in_progress">
                    <div class="category-info">
                        <div class="category-title">進行中任務</div>
                        <div class="category-count">${
                          inProgressTasks.length
                        }</div>
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

    // Add click handlers for category cards
    this.addCategoryCardHandlers();

    // Initialize progress bars
    this.initProgressBars();
  }

  /**
   * Create HTML for a task card
   * @param {Object} task - Task data
   * @param {boolean} isCompleted - Whether the task is completed
   * @returns {string} - HTML string
   */
  createTaskCardHTML(task, isCompleted) {
    const taskId = task.id;

    const dateLabel = "截止日期";
    const dateValue = task.end_date;
    const dateFormatted = dateValue ? dateValue.split(" ")[0] : "未設定";

    return `
        <div class="task-card ${
          isCompleted ? "completed" : ""
        }" data-task-id="${taskId}">
            <div class="task-info">
                <div class="task-title">${task.name}</div>
                <div class="project-name">${task.project_name || "專案"}</div>
            </div>
            <div class="progress-container">
                <div class="progress-label">進度</div>
                <div class="progress-percentage">${task.progress}%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${
                  task.progress
                }%" progress="${task.progress}"></div>
            </div>
            <div class="task-due-date">
                <i class="date-icon far fa-calendar"></i>
                ${dateLabel}：${dateFormatted}
            </div>
        </div>
    `;
  }

  addSectionToggleHandlers() {
    const sectionHeaders = this.findByQuery(".section-header");
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
  }

  /**
   * Initialize and set up progress bars
   */
  initProgressBars() {
    const progressBars = this.findByQuery(".progress-fill");
    progressBars.forEach((bar) => {
      // 取得已設定的 width 百分比 (如果直接在 style 中設定)
      const style = window.getComputedStyle(bar);
      const width = style.width;
      const parentWidth = window.getComputedStyle(bar.parentElement).width;

      // 計算進度百分比
      let progressValue = Math.round(
        (parseInt(width) / parseInt(parentWidth)) * 100
      );

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

        // Get category type and scroll to corresponding section
        const category = card.getAttribute("data-category");
        const sectionType =
          category === "in_progress" ? "continue" : "completed";

        // Find the corresponding task section and scroll to it
        const section = this.findByQuery(
          `[data-section-type="${sectionType}"]`
        )[0];
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });

          // Make sure the section is expanded
          const taskCards = section.querySelector(".task-cards");
          if (taskCards && taskCards.style.display === "none") {
            // Simulate a click on the header to expand it
            section.querySelector(".section-header").click();
          }
        }
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
   */
  updateTaskProgress(taskId, progress) {
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
  }
}
