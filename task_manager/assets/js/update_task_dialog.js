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
    // 重置為載入中的表格行
    historyTableBody.innerHTML = `
      <tr class="progress-table-row loading-message">
        <td colspan="4">載入中...</td>
      </tr>
    `;
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

    // 顯示載入中訊息
    historyTableBody.innerHTML = `
      <tr class="progress-table-row loading-message">
        <td colspan="4">載入中...</td>
      </tr>
    `;

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
        // 顯示錯誤訊息在表格中
        historyTableBody.innerHTML = `
          <tr class="progress-table-row">
            <td colspan="4" style="color: #dc3545; text-align: center;">載入失敗，請重試</td>
          </tr>
        `;
      });
  }

  // Update task history table and progress bar
  function updateTaskHistory(history, latestProgress) {
    // Update progress bar
    const progress = latestProgress || 0;
    progressBar.style.width = `${progress}%`;
    currentProgress.textContent = `${progress}%`;

    // Clear existing content
    historyTableBody.innerHTML = "";

    // Add history rows using table row elements
    if (history && history.length > 0) {
      history.forEach((item) => {
        const row = document.createElement("tr");
        row.className = "progress-table-row";
        row.innerHTML = `
          <td>${escapeHTML(item.user)}</td>
          <td>${escapeHTML(item.updated_at)}</td>
          <td>${escapeHTML(item.info)}</td>
          <td class="progress-percentage">${item.progress}%</td>
        `;
        historyTableBody.appendChild(row);
      });
    } else {
      // No history available
      const emptyRow = document.createElement("tr");
      emptyRow.className = "progress-table-row";
      emptyRow.innerHTML = `
        <td colspan="4" style="text-align: center; color: #6b7280;">尚無歷史紀錄</td>
      `;
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
            progressInput.value = "";

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
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Format date time for display
  function formatDateTime(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  }

  // Add a success message style to CSS
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

  // Make loadTaskData globally accessible if needed
  window.openUpdateTaskDialog = function(taskId) {
    loadTaskData(taskId);
    openDialog();
  };
});