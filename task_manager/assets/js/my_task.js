document.addEventListener("DOMContentLoaded", function () {
  // Initialize UI elements
  initializeTaskViewUI();

  // Fetch and display my tasks
  fetchMyTasks();

  // Setup task view switching
  setupTaskViewSwitching();
});

function initializeTaskViewUI() {
  // Setup view buttons
  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });

  // Setup status switch slider
  const firstButton = document.querySelector(".status-switch .switch-option");
  const slider = document.querySelector(".status-switch .slider");

  if (firstButton && slider) {
    // Position the slider under the first button initially
    const buttonWidth = firstButton.offsetWidth;
    slider.style.left = `${firstButton.offsetLeft}px`;
    slider.style.width = `${buttonWidth}px`;
    firstButton.classList.add("active");
  }

  // Add click events to switch buttons
  document
    .querySelectorAll(".status-switch .switch-option")
    .forEach((button) => {
      button.addEventListener("click", () => {
        // Update active button
        document
          .querySelectorAll(".status-switch .switch-option")
          .forEach((btn) => {
            btn.classList.remove("active");
          });
        button.classList.add("active");

        // Update slider position
        const buttonWidth = button.offsetWidth;
        slider.style.left = `${button.offsetLeft}px`;
        slider.style.width = `${buttonWidth}px`;
      });
    });
}

function fetchMyTasks() {
  const taskViewerContainer = document.getElementById("taskViewerContainer");
  if (!taskViewerContainer) return;

  try {
    const csrfTokenElement = document.querySelector(
      'input[name="csrfmiddlewaretoken"]'
    );
    if (!csrfTokenElement) {
      throw new Error("CSRF token not found");
    }
    const csrfToken = csrfTokenElement.value;

    fetch("/get_my_task/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Store tasks data in a global variable for access by view switchers
        window.myTasksData = data.tasks_data;
        console.log(data);
        // Trigger the active view to display tasks
        const activeButton = document.querySelector(
          ".status-switch .switch-option.active"
        );
        if (activeButton) {
          activeButton.click();
        }
      })
      .catch((error) => {
        console.error("Error fetching task data:", error);
        taskViewerContainer.innerHTML =
          '<div class="error-message">Failed to load task data. Please try again later.</div>';
      });
  } catch (error) {
    console.error("Error in task viewer initialization:", error);
    taskViewerContainer.innerHTML =
      '<div class="error-message">An error occurred. Please try again later.</div>';
  }
}

function setupTaskViewSwitching() {
  const buttons = document.querySelectorAll(".status-switch .switch-option");
  const taskViewerContainer = document.getElementById("taskViewerContainer");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      try {
        buttons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const view = this.getAttribute("data-view");

        // Use the already fetched tasks data
        const tasks = window.myTasksData;

        // Check if tasks exist and have items
        if (!tasks || tasks.length === 0) {
          taskViewerContainer.innerHTML =
            '<div class="error-message">還未創建任務</div>';
          return;
        }

        if (view === "gantt") {
          displayGanttView(tasks, taskViewerContainer);
        } else if (view === "task_list") {
          displayListView(tasks, taskViewerContainer);
        } else if (view === "calendar") {
          displayCalendarView(tasks, taskViewerContainer);
        }
      } catch (error) {
        console.error("Error in view switching:", error);
        taskViewerContainer.innerHTML =
          '<div class="error-message">An error occurred while changing views. Please try again later.</div>';
      }
    });
  });
}

function displayGanttView(tasks, container) {
  try {
    container.innerHTML = '<div id="gantt" class="gantt-target"></div>';

    // Format tasks for Gantt chart
    const ganttTasks = tasks.map((task) => {
      return {
        id: task.id,
        name: task.name,
        start: task.start_date,
        end: task.end_date,
        progress: task.progress,
        status: task.status,
        description: task.description,
      };
    });

    const gantt = new Gantt("#gantt", ganttTasks, {
      step: 24,
      bar_height: 30,
      container_height: 600,
      bar_corner_radius: 3,
      arrow_curve: 5,
      padding: 18,
      view_mode: "Day",
      date_format: "YYYY-MM-DD",
      start_date: new Date(new Date().setDate(new Date().getDate() - 10)),
      custom_popup_html: function (task) {
        const statusText = task.status === 'completed' ? '已完成' :
                          task.status === 'overdue' ? '逾期' :
                          task.status === 'not-started' ? '未開始' :
                          task.status === 'in-progress' ? '進行中' : 
                          (task.status || '未知');
        
        const safeName = task.name || '';
        const safeDescription = task.description || '';
        
        return `
          <div class="details-container">
            <h4>${safeName}</h4>
            <p>狀態: ${statusText}</p>
            <p>開始: ${task.start || ''}</p>
            <p>結束: ${task.end || ''}</p>
            <p>進度: ${task.progress || 0}%</p>
            ${safeDescription ? `<p>描述: ${safeDescription}</p>` : ''}
          </div>
        `;
      },
    });
  } catch (error) {
    console.error("Error initializing Gantt chart:", error);
    container.innerHTML =
      '<div class="error-message">Failed to load Gantt chart. Please try again later.</div>';
  }
}

function displayListView(tasks, container) {
  try {
    // Create container for list view
    container.innerHTML =
      '<div id="task-list-container" class="task-list-container"></div>';
    const listContainer = document.getElementById("task-list-container");

    // Initialize TaskRenderer with the container and tasks
    const taskRenderer = new TaskRenderer({
      container: listContainer,
      tasks: tasks,
    });
  } catch (error) {
    console.error("Error initializing List view:", error);
    container.innerHTML =
      '<div class="error-message">Failed to load task list. Please try again later.</div>';
  }
}

function displayCalendarView(tasks, container) {
  try {
    container.innerHTML = '<div id="calendar"></div>';

    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next",
        center: "title",
        right: "today",
      },
      locale: "zh-tw",
      displayEventTime: false,
      height: 'auto',
      fixedWeekCount: true,
      showNonCurrentDates: true,
      dayMaxEvents: true,
      eventTimeFormat: {
        hour: "2-digit",
        minute: "2-digit",
        meridiem: false,
      },
      events: tasks.map((task) => ({
        id: task.id,
        title: task.name,
        start: task.start_date,
        end: task.end_date,
        color:
          task.status === 'completed'
            ? "var(--dark-green)"
            : task.status === 'overdue'
            ? "var(--red)"
            : "var(--dark-blue)",
        className:
          task.status === 'completed'
            ? "task-completed"
            : task.status === 'overdue'
            ? "task-overdue"
            : "task-in-progress",
        extendedProps: {
          progress: task.progress,
          description: task.description || "",
          project_name: task.project_name || "",
          status: task.status,
        },
      })),
      eventClick: function (info) {
        Swal.fire({
          title: info.event.title,
          html: `
            <div class="task-detail-popup">
              <p><strong>專案:</strong> ${
                info.event.extendedProps.project_name
              }</p>
              <p><strong>狀態:</strong> ${
                info.event.extendedProps.status === 'completed' ? '已完成' :
                info.event.extendedProps.status === 'overdue' ? '逾期' :
                info.event.extendedProps.status === 'not-started' ? '未開始' :
                info.event.extendedProps.status === 'in-progress' ? '進行中' : 
                info.event.extendedProps.status
              }</p>
              <p><strong>進度:</strong> ${
                info.event.extendedProps.progress
              }%</p>
              <p><strong>開始:</strong> ${info.event.start.toLocaleDateString()}</p>
              <p><strong>結束:</strong> ${
                info.event.end
                  ? info.event.end.toLocaleDateString()
                  : "無結束日期"
              }</p>
              ${
                info.event.extendedProps.description
                  ? `<p><strong>描述:</strong> ${info.event.extendedProps.description}</p>`
                  : ""
              }
            </div>
          `,
          icon:
            info.event.extendedProps.status === 'completed'
              ? "success"
              : info.event.extendedProps.status === 'overdue'
              ? "error"
              : "info",
        });
      },
    });
    calendar.render();

    window.addEventListener("resize", function () {
      calendar.updateSize();
    });
  } catch (error) {
    console.error("Error initializing Calendar view:", error);
    container.innerHTML =
      '<div class="error-message">Failed to load calendar view. Please try again later.</div>';
  }
}
