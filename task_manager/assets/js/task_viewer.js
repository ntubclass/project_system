document.addEventListener("DOMContentLoaded", function () {
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

        fetch(`/project_task/${projectId}`, {
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
            console.log("Task data received:", data);

            if (view == "gantt") {
              try {
                taskViewerContainer.innerHTML =
                  '<div id="gantt" class="gantt-target"></div>';

                // Extract tasks array from the response object
                const tasks = data.tasks_data;

                // Check if tasks exist and have items
                if (!tasks || tasks.length === 0) {
                  throw new Error("No tasks found");
                }

                // Format tasks for Gantt chart
                const ganttTasks = tasks.map((task) => {
                  return {
                    id: task.id,
                    name: task.name,
                    start: task.start_date,
                    end: task.end_date,
                    progress: task.progress,
                  };
                });

                const gantt = new Gantt("#gantt", ganttTasks, {
                  step: 24,
                  bar_height: 30,
                  container_height: 600,
                  bar_corner_radius: 3,
                  arrow_curve: 5,
                  padding: 18,
                  view_mode: "Day", // Change to Week for a medium-level view
                  date_format: "YYYY-MM-DD",
                  start_date: new Date(
                    new Date().setDate(new Date().getDate() - 10)
                  ), // Start 10 days before today
                  custom_popup_html: function (task) {
                    return `
                                <div class="details-container">
                                    <h4>${task.name}</h4>
                                    <p>開始: ${task.start}</p>
                                    <p>結束: ${task.end}</p>
                                    <p>進度: ${task.progress}%</p>
                                </div>
                            `;
                  },
                });
              } catch (ganttError) {
                console.error("Error initializing Gantt chart:", ganttError);
                taskViewerContainer.innerHTML =
                  '<div class="error-message">Failed to load Gantt chart. Please try again later.</div>';
              }
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
});
