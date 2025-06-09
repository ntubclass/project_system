window.updateTaskMembersListUI = function () {
  const membersList = document.getElementById("editMembersList");
  if (!membersList) return;

  membersList.innerHTML = "";

  if (!window.editMemberlist) {
    window.editMemberlist = [];
  }

  window.editMemberlist.forEach((member, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="member-box">
        <div>
          <img src="${
            member.photo || "/static/default-avatar.png"
          }" class="user-photo">
          <span class="user-name">${member.name}</span>
          <span class="user-email">${member.email}</span>
        </div>
        <i class="fa-solid fa-xmark remove-edit-member" data-index="${index}"></i>
      </div>
    `;
    membersList.appendChild(li);
  });

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-edit-member").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"), 10);
      window.editMemberlist.splice(index, 1);
      window.updateTaskMembersListUI();
    });
  });
};

document.addEventListener("DOMContentLoaded", function () {
  // Initialize progress bars animation
  function initializeProgressBars() {
    const progressBars = document.querySelectorAll(".progress-fill[progress]");

    progressBars.forEach((bar) => {
      const targetProgress = parseInt(bar.getAttribute("progress")) || 0;
      const targetWidth = `${targetProgress}%`;

      // 先移除transition，設置初始寬度為0
      bar.style.transition = "none";
      bar.style.width = "0%";

      // 強制瀏覽器重新計算樣式
      bar.offsetWidth;

      // 使用 setTimeout 讓瀏覽器完成初始渲染後再開始動畫
      setTimeout(() => {
        // 重新添加transition並設置進度條寬度，觸發動畫
        bar.style.transition = "width 0.3s ease";
        bar.style.width = targetWidth;
      }, 50); // 50ms 延遲確保DOM完全就緒

      // 更新對應的百分比文字顯示
      const progressText = bar
        .closest(".task-progress")
        ?.querySelector(".progress-text");
      if (progressText) {
        // 延遲更新百分比顯示，讓動畫更自然
        setTimeout(() => {
          progressText.textContent = `${targetProgress}%`;
        }, 100);
      }
    });
  }

  // Call initializeProgressBars when page loads
  initializeProgressBars();

  // Reusable dialog setup function
  function setupDialog(dialogId, cancelBtnId, closeBtnId) {
    const dialog = document.getElementById(dialogId);
    const cancelBtn = document.getElementById(cancelBtnId);
    const closeBtn = document.getElementById(closeBtnId);

    function closeDialogWithAnimation() {
      dialog.setAttribute("closing", "");
      setTimeout(() => {
        dialog.removeAttribute("closing");
        dialog.close();
      }, 200);
    }    if (dialog) {
      dialog.addEventListener("click", (e) => {
        // 找到 dialog content 元素
        const dialogContent = dialog.querySelector('.dialog-content');
        if (dialogContent) {
          const rect = dialogContent.getBoundingClientRect();
          const isInDialog =
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width;
          if (!isInDialog) {
            closeDialogWithAnimation();
          }
        } else {
          // 如果找不到 dialog-content，點擊對話框背景就關閉
          if (e.target === dialog) {
            closeDialogWithAnimation();
          }
        }
      });

      dialog.addEventListener("cancel", (e) => {
        e.preventDefault();
        closeDialogWithAnimation();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        closeDialogWithAnimation();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeDialogWithAnimation();
      });
    }

    return { dialog, closeDialogWithAnimation };
  }

  // Helper functions
  function showError(element, message) {
    element.innerHTML = `<div class="alert alert-danger">${escapeHTML(
      message
    )}</div>`;
  }

  function showSuccess(element, message) {
    element.innerHTML = `<div class="alert alert-success">${escapeHTML(
      message
    )}</div>`;
    setTimeout(() => {
      element.innerHTML = "";
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

  // Replace the setupEditTaskDialog function with this updated version
  function setupEditTaskDialog() {
    const { dialog, closeDialogWithAnimation } = setupDialog(
      "editTaskDialog",
      "cancelEditTaskBtn",
      "closeEditTaskBtn"
    );

    // Global variable for member list - use editMemberlist for the edit dialog
    window.editMemberlist = window.editMemberlist || [];

    // Bind all .btn-edit buttons
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const taskId = this.getAttribute("data-task-id");

        // Set taskId to form data attribute
        const form = document.getElementById("editTaskForm");
        if (form) {
          form.setAttribute("data-task-id", taskId);
        }

        fetch(`/edit_task/${taskId}`)
          .then((response) => response.json())
          .then((data) => {
            const task = data.task || {};

            // Use the correct ID references from edit_task_dialog.html
            document.getElementById("editTaskName").value =
              task.task_name || "";
            document.getElementById("editStartDate").value = (
              task.start_date || ""
            ).split("T")[0];
            document.getElementById("editEndDate").value = (
              task.end_date || ""
            ).split("T")[0];
            document.getElementById("editContent").value = task.content || "";

            // Use the correct ID for the members list in the edit dialog
            const membersList = document.getElementById("editMembersList");
            window.editMemberlist.length = 0;

            if (membersList) {
              membersList.innerHTML = "";
              if (task.members && Array.isArray(task.members)) {
                task.members.forEach((member) => {
                  const li = document.createElement("li");
                  li.innerHTML = `
                  <div class="member-box">
                    <div>
                      <img src="${
                        member.photo || "/static/default-avatar.png"
                      }" class="user-photo">
                      <span class="user-name">${member.name}</span>
                      <span class="user-email">${member.email}</span>
                    </div>
                    <i class="fa-solid fa-xmark remove-edit-member" data-index="${
                      window.editMemberlist.length
                    }"></i>
                  </div>
                `;
                  membersList.appendChild(li);

                  // Add member to editMemberlist array
                  window.editMemberlist.push({
                    name: member.name,
                    email: member.email,
                    photo: member.photo || "/static/default-avatar.png",
                  });
                });

                // Add remove event listeners
                document
                  .querySelectorAll(".remove-edit-member")
                  .forEach((btn) => {
                    btn.addEventListener("click", function () {
                      const index = parseInt(
                        this.getAttribute("data-index"),
                        10
                      );
                      window.editMemberlist.splice(index, 1);
                      updateEditMembersListUI();
                    });
                  });
              }
            }

            if (dialog) dialog.showModal();
          })
          .catch((err) => {
            console.error("取得任務資料失敗:", err);
          });
      });
    });

    // Function to update the edit members list UI
    function updateEditMembersListUI() {
      const membersList = document.getElementById("editMembersList");
      if (!membersList) return;

      membersList.innerHTML = "";

      window.editMemberlist.forEach((member, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
        <div class="member-box">
          <div>
            <img src="${
              member.photo || "/static/default-avatar.png"
            }" class="user-photo">
            <span class="user-name">${member.name}</span>
            <span class="user-email">${member.email}</span>
          </div>
          <i class="fa-solid fa-xmark remove-edit-member" data-index="${index}"></i>
        </div>
      `;
        membersList.appendChild(li);
      });

      // Add event listeners to remove buttons
      document.querySelectorAll(".remove-edit-member").forEach((btn) => {
        btn.addEventListener("click", function () {
          const index = parseInt(this.getAttribute("data-index"), 10);
          window.editMemberlist.splice(index, 1);
          updateEditMembersListUI();
        });
      });
    }

    // Add event listener for the openEditMemberBtn
    const openEditMemberBtn = document.getElementById("openEditMemberBtn");
    if (openEditMemberBtn) {
      openEditMemberBtn.addEventListener("click", function () {
        const editMemberDialog = document.getElementById("editMemberDialog");
        if (editMemberDialog) {
          // Set a data attribute to indicate the referrer dialog
          editMemberDialog.setAttribute("data-referrer-dialog", "editTask");
          editMemberDialog.showModal();
        }
      });
    }

    // Handle form submission
    document
      .getElementById("editTaskForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();

        const taskId = this.getAttribute("data-task-id");
        if (!taskId) {
          alert("找不到任務 ID，請重新打開編輯視窗");
          return;
        }

        // Use editMemberlist instead of addMemberlist
        window.editMemberlist.forEach((member, index) => {
          const nameInput = document.createElement("input");
          nameInput.type = "hidden";
          nameInput.name = `member_name_${index}`;
          nameInput.value = member.name;

          const emailInput = document.createElement("input");
          emailInput.type = "hidden";
          emailInput.name = `member_email_${index}`;
          emailInput.value = member.email;

          this.appendChild(nameInput);
          this.appendChild(emailInput);
        });

        // Add member count hidden field
        const countInput = document.createElement("input");
        countInput.type = "hidden";
        countInput.name = "member_count";
        countInput.value = window.editMemberlist.length;
        this.appendChild(countInput);

        const formData = new FormData(this);

        fetch(`/edit_task/${taskId}/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              closeDialogWithAnimation();
              // Reload page to reflect changes
              window.location.reload();
            } else {
              const formErrors = document.getElementById("editFormErrors");
              if (formErrors) {
                formErrors.innerHTML = `<div class="alert alert-danger">${escapeHTML(
                  data.error || "更新失敗"
                )}</div>`;
              } else {
                console.error(data.error || "更新失敗");
              }
            }
          })
          .catch((err) => {
            console.error("更新任務失敗:", err);
          });
      });
  }

  // Setup Update Task Dialog functionality
  function setupUpdateTaskDialog() {
    let currentTaskId = null;
    const updateTaskDialog = document.getElementById("updateTaskDialog");
    const updateTaskForm = document.getElementById("updateTaskForm");
    const progressBar = document.getElementById("progressBar");
    const currentProgress = document.getElementById("currentProgress");
    const historyTableBody = document.getElementById("historyTableBody");
    const taskIdInput = document.getElementById("taskIdInput");
    const formErrors = document.getElementById("formErrors");

    const { closeDialogWithAnimation } = setupDialog(
      "updateTaskDialog",
      "cancelUpdateTaskBtn",
      "closeUpdateTaskBtn"
    );

    function resetForm() {
      if (updateTaskForm) updateTaskForm.reset();
      if (formErrors) formErrors.innerHTML = "";
      if (historyTableBody)
        historyTableBody.innerHTML = `
        <tr class="progress-table-row loading-message">
          <td colspan="4">載入中...</td>
        </tr>
      `;
      currentTaskId = null;
    }

    // Load task data from server
    function loadTaskData(taskId) {
      currentTaskId = taskId;
      if (taskIdInput) taskIdInput.value = taskId;

      if (historyTableBody) {
        historyTableBody.innerHTML = historyTableBody.innerHTML = `
        <tr class="progress-table-row loading-message">
          <td colspan="4">載入中...</td>
        </tr>
      `;
      }

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
            showError(formErrors, "無法載入任務資料");
          }
        })
        .catch((error) => {
          console.error("Error fetching task data:", error);
          showError(formErrors, "發生錯誤，請重試");
        });
    }

    // Update task history table and progress bar
    function updateTaskHistory(history, latestProgress) {
      // Update progress bar with animation
      if (progressBar && currentProgress) {
        const progress = latestProgress || 0;

        // 先移除transition，設置初始寬度為0
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";

        // 強制瀏覽器重新計算樣式
        progressBar.offsetWidth;

        // 使用 setTimeout 讓瀏覽器完成初始渲染後再開始動畫
        setTimeout(() => {
          // 重新添加transition並設置進度條寬度，觸發動畫
          progressBar.style.transition = "width 0.3s ease";
          progressBar.style.width = `${progress}%`;
        }, 50); // 50ms 延遲確保DOM完全就緒

        // 延遲更新百分比顯示，讓動畫更自然
        setTimeout(() => {
          currentProgress.textContent = `${progress}%`;
        }, 100);
      }

      // Clear loading message
      if (historyTableBody) {
        historyTableBody.innerHTML = "";

        // Add history rows
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
          const emptyRow = document.createElement("tr");
          emptyRow.className = "progress-table-row";
          emptyRow.innerHTML = `<td colspan="4" style="text-align: center; color: #6b7280;">尚無歷史紀錄</td>`;
          historyTableBody.appendChild(emptyRow);
        }
      }
    }

    // Open dialog when any .btn-update button is clicked
    document.querySelectorAll(".btn-update").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const taskId = this.getAttribute("data-task-id");
        if (taskId) {
          loadTaskData(taskId);
          if (updateTaskDialog) updateTaskDialog.showModal();
        }
      });
    });

    // Form submission
    if (updateTaskForm) {
      updateTaskForm.addEventListener("submit", function (e) {
        const infoInput = document.getElementById("infoInput");
        const progressInput = document.getElementById("progressInput");

        // Validate form
        if (!infoInput.value.trim()) {
          showError(formErrors, "請填寫事項");
          return;
        }

        // Fixed validation to properly handle 100% progress
        const progress = parseInt(progressInput.value, 10);
        if (isNaN(progress) || progress < 0 || progress > 100) {
          showError(formErrors, "進度必須是0-100之間的數字");
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
              showSuccess(formErrors, "進度已成功更新");
            } else {
              showError(formErrors, data.error || "更新失敗，請重試");
            }
          })
          .catch((error) => {
            console.error("Error updating task:", error);
            showError(formErrors, "發生錯誤，請重試");
          });
      });
    }
  }

  function deleteTask(taskId) {
    Swal.fire({
      title: "確認刪除任務",
      text: "您確定要刪除此任務嗎？此操作無法還原。",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        const csrftoken = document.querySelector(
          "[name=csrfmiddlewaretoken]"
        ).value;

        fetch(`/delete_task/${taskId}/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            // Store the status for later use
            const status = response.status;
            return response.json().then((data) => ({ data, status }));
          })
          .then(({ data, status }) => {
            // Now we can check both data.message and status
            if (data.message && status === 200) {
              Swal.fire({
                icon: "success",
                title: "刪除成功",
                text: "任務已成功刪除！",
              }).then(() => {
                // Remove the task element from the DOM or reload the page
                const taskElement = document.querySelector(
                  `.task-item[task-id="${taskId}"]`
                );
                if (taskElement) {
                  taskElement.remove();
                } else {
                  location.reload(); // Fallback to reload if element not found
                }
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "刪除失敗",
                text: data.error || "伺服器錯誤，請稍後再試！",
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
              icon: "error",
              title: "刪除失敗",
              text: "伺服器錯誤，請稍後再試！",
            });
          });
      }
    });
  }

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const taskId = this.getAttribute("data-task-id");
      if (taskId) {
        deleteTask(taskId);
      }
    });
  });

  // Add success message style to CSS
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

  // Initialize both dialogs
  setupEditTaskDialog();
  setupUpdateTaskDialog();
});
