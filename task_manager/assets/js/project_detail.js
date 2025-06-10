document.addEventListener("DOMContentLoaded", function () {  // 設置進度條長度和更新顯示的百分比
  function initializeProgressBars() {
    // 獲取所有進度條元素
    const progressBars = document.querySelectorAll(".progress-fill");

    // 遍歷每個進度條元素
    progressBars.forEach((bar) => {
      // 獲取progress屬性值
      const progressValue = bar.getAttribute("progress");      // 如果存在progress屬性，則設置寬度
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

        // 更新 stat-value 中的百分比顯示
        const statCard = bar.closest(".stat-card");
        if (statCard) {
          const progressPercentage = statCard.querySelector(
            ".progress-percentage"
          );
          if (progressPercentage) {
            // 延遲更新百分比顯示，讓動畫更自然
            setTimeout(() => {
              progressPercentage.textContent = progressValue;
            }, 100);
          }
        }
      }
    });
  }

  // 初始化進度條
  initializeProgressBars();

  // 任務切換功能
  const buttons = document.querySelectorAll(".status-switch .switch-option");
  const taskViewerContainer = document.getElementById("taskViewerContainer");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      try {
        buttons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const view = this.getAttribute("data-view");

        const csrfTokenElement = document.querySelector(
          'input[name="csrfmiddlewaretoken"]'
        );
        if (!csrfTokenElement) {
          throw new Error("CSRF token not found");
        }
        const csrfToken = csrfTokenElement.value;
        // use url search params to get project id
        const urlParts = window.location.pathname.split("/");
        let projectId = null; // Initialize projectId to null
        if (urlParts.length > 3) {
          projectId = urlParts[urlParts.length - 2];
        }

        fetch(`/get_project_task/${projectId}`, {
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
            // Extract tasks array from the response object
            const tasks = data.tasks_data;

            // Check if tasks exist and have items
            if (!tasks || tasks.length === 0) {
              taskViewerContainer.innerHTML =
                '<div class="error-message">此專案還未創建任務</div>';
              return;
            }

            if (view == "gantt") {
              try {
                taskViewerContainer.innerHTML =
                  '<div id="gantt" class="gantt-target"></div>';

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
                  start_date: new Date(
                    new Date().setDate(new Date().getDate() - 14)
                  ),
                  custom_popup_html: function (task) {
                    const safeName = task.name || '';
                    const safeDescription = task.description || '';
                    
                    return `
                                <div class="details-container">
                                    <h4>${safeName}</h4>
                                    <p>開始: ${task.start || ''}</p>
                                    <p>結束: ${task.end || ''}</p>
                                    <p>進度: ${task.progress || 0}%</p>
                                    ${safeDescription ? `<p>描述: ${safeDescription}</p>` : ''}
                                </div>
                            `;
                  },
                });
              } catch (ganttError) {
                console.error("Error initializing Gantt chart:", ganttError);
                taskViewerContainer.innerHTML =
                  '<div class="error-message">Failed to load Gantt chart. Please try again later.</div>';
              }
            } else if (view == "task_list") {
              try {
                // Create container for list view
                taskViewerContainer.innerHTML =
                  '<div id="task-list-container" class="task-list-container"></div>';

                // Use the TaskRenderer to render the list view
                const listContainer = document.getElementById(
                  "task-list-container"
                );

                // Add project name to each task for rendering
                const tasksWithProject = tasks.map((task) => {
                  return {
                    ...task,
                    project_name: data.project_name,
                  };
                });

                // Initialize TaskRenderer with the container and tasks
                const taskRenderer = new TaskRenderer({
                  container: listContainer,
                  tasks: tasksWithProject,
                });
              } catch (listError) {
                console.error("Error initializing List view:", listError);
                taskViewerContainer.innerHTML =
                  '<div class="error-message">Failed to load task list. Please try again later.</div>';
              }
            } else if (view == "calendar") {
              taskViewerContainer.innerHTML = '<div id="calendar"></div>';

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
                displayEventEnd: false,
                eventDisplay: 'block',
                height: 'auto',
                fixedWeekCount: true,
                showNonCurrentDates: true,
                dayMaxEvents: true,
                eventTimeFormat: {
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                },
                events: tasks.map((task) => {
                  // 動態確定任務狀態
                  const today = new Date();
                  const startDate = new Date(task.start_date);
                  const endDate = new Date(task.end_date);
                  
                  let taskStatus;
                  let color;
                  let className;
                  
                  if (task.progress >= 100) {
                    taskStatus = '已完成';
                    color = '#4CAF50';
                    className = 'task-completed';
                  } else if (endDate < today) {
                    taskStatus = '已逾期';
                    color = '#F44336';
                    className = 'task-overdue';
                  } else if (startDate <= today) {
                    taskStatus = '進行中';
                    color = '#2196F3';
                    className = 'task-in-progress';
                  } else {
                    taskStatus = '未開始';
                    color = '#FF9800';
                    className = 'task-not-started';
                  }
                  
                  return {
                    id: task.id,
                    title: task.name,
                    start: task.start_date,
                    end: task.end_date,
                    color: color,
                    className: className,
                    extendedProps: {
                      progress: task.progress,
                      description: task.description,
                      status: taskStatus,
                      originalStatus: task.status,
                    },
                  };
                }),
                eventClick: function (info) {
                  Swal.fire({
                    title: info.event.title,
                    html: `
                        <div class="task-detail-popup">
                          <p><strong>狀態:</strong> ${info.event.extendedProps.status}</p>
                          <p><strong>進度:</strong> ${info.event.extendedProps.progress}%</p>
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
                      info.event.extendedProps.status === '已完成'
                        ? "success"
                        : info.event.extendedProps.status === '已逾期'
                        ? "error"
                        : "info",
                  });
                },
              });
              calendar.render();

              window.addEventListener("resize", function () {
                calendar.updateSize();
              });
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
    });
  });

  // Trigger click on the default active button to load initial view
  const activeButton = document.querySelector(
    ".status-switch .switch-option.active"
  );
  if (activeButton) {
    activeButton.click();
  }
});
