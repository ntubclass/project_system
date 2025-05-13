document.addEventListener("DOMContentLoaded", function () {
  let currentTaskId = null;
  const updateTaskDialog = document.getElementById("updateTaskDialog");
  const updateTaskForm = document.getElementById("updateTaskForm");
  const cancelUpdateTaskBtn = document.getElementById("cancelUpdateTaskBtn");
  const closeUpdateTaskBtn = document.getElementById("closeUpdateTaskBtn");
  const progressBar = document.getElementById("progressBar");
  const currentProgress = document.getElementById("currentProgress");
  const historyTableBody = document.getElementById("historyTableBody");
  const taskIdInput = document.getElementById("taskIdInput");
  const formErrors = document.getElementById("formErrors");

  // Dialog handling functions
  function openDialog() {
    updateTaskDialog.showModal();
  }

  function closeDialogWithAnimation() {
    updateTaskDialog.setAttribute("closing", "");
    setTimeout(() => {
      updateTaskDialog.removeAttribute("closing");
      updateTaskDialog.close();
      resetForm();
    }, 200);
  }

  function resetForm() {
    updateTaskForm.reset();
    formErrors.innerHTML = "";
    historyTableBody.innerHTML =
      '<div class="progress-table-row loading-message"><div class="table-cell">載入中...</div></div>';
    currentTaskId = null;
  }

  // Dialog event listeners
  if (updateTaskDialog) {
    updateTaskDialog.addEventListener("click", (e) => {
      const rect = updateTaskDialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        closeDialogWithAnimation();
      }
    });

    updateTaskDialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialogWithAnimation();
    });
  }

  if (cancelUpdateTaskBtn) {
    cancelUpdateTaskBtn.addEventListener("click", () => {
      closeDialogWithAnimation();
    });
  }

  if (closeUpdateTaskBtn) {
    closeUpdateTaskBtn.addEventListener("click", () => {
      closeDialogWithAnimation();
    });
  }

  // Open dialog when any .btn-update button is clicked
  document.querySelectorAll(".btn-update").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const taskId = this.getAttribute("data-task-id");
      if (taskId) {
        loadTaskData(taskId);
        openDialog();
      }
    });
  });

  // Load task data from server
  function loadTaskData(taskId) {
    currentTaskId = taskId;
    taskIdInput.value = taskId;

    historyTableBody.innerHTML =
      '<div class="progress-table-row loading-message"><div class="table-cell">載入中...</div></div>';

    fetch(`/update_task/${taskId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          updateTaskHistory(data.history, data.latest_progress);
        } else {
          showError("無法載入任務資料");
        }
      })
      .catch((error) => {
        console.error("Error fetching task data:", error);
        showError("發生錯誤，請重試");
      });
  }

  // Update task history table and progress bar
  function updateTaskHistory(history, latestProgress) {
    // Update progress bar
    const progress = latestProgress || 0;
    progressBar.style.width = `${progress}%`;
    currentProgress.textContent = `${progress}%`;

    // Clear loading message
    historyTableBody.innerHTML = "";

    // Add history rows
    if (history && history.length > 0) {
      history.forEach((item) => {
        const row = document.createElement("div");
        row.className = "progress-table-row";
        row.innerHTML = `
          <div class="table-cell">${escapeHTML(item.user)}</div>
          <div class="table-cell">${escapeHTML(item.updated_at)}</div>
          <div class="table-cell">${escapeHTML(item.info)}</div>
          <div class="table-cell">${item.progress}%</div>
        `;
        historyTableBody.appendChild(row);
      });
    } else {
      const emptyRow = document.createElement("div");
      emptyRow.className = "progress-table-row";
      emptyRow.innerHTML = '<div class="table-cell">尚無歷史紀錄</div>';
      historyTableBody.appendChild(emptyRow);
    }
  }

  // Form submission
  if (updateTaskForm) {
    updateTaskForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const infoInput = document.getElementById("infoInput");
      const progressInput = document.getElementById("progressInput");

      // Validate form
      if (!infoInput.value.trim()) {
        showError("請填寫事項");
        return;
      }

      if (
        !progressInput.value ||
        isNaN(progressInput.value) ||
        progressInput.value < 0 ||
        progressInput.value > 100
      ) {
        showError("進度必須是0-100之間的數字");
        return;
      }

      // Get form data
      const formData = new FormData(updateTaskForm);
      const csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;
      // Submit form using fetch
      fetch(`/update_task/${currentTaskId}/`, {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": csrftoken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update the UI with the new data
            loadTaskData(currentTaskId);

            // Clear form inputs
            infoInput.value = "";

            // Show success message
            showSuccess("進度已成功更新");
          } else {
            showError(data.error || "更新失敗，請重試");
          }
        })
        .catch((error) => {
          console.error("Error updating task:", error);
          showError("發生錯誤，請重試");
        });
    });
  }

  // Helper functions
  function showError(message) {
    formErrors.innerHTML = `<div class="alert alert-danger">${escapeHTML(
      message
    )}</div>`;
  }

  function showSuccess(message) {
    formErrors.innerHTML = `<div class="alert alert-success">${escapeHTML(
      message
    )}</div>`;
    setTimeout(() => {
      formErrors.innerHTML = "";
    }, 3000);
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Add a success message style to CSS (can be added to your CSS file)
  const style = document.createElement("style");
  style.innerHTML = `
    .form-errors .alert-success {
      background-color: #d1e7dd;
      border: 0.5px solid #badbcc;
      color: #0f5132;
      padding: 10px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);
});
