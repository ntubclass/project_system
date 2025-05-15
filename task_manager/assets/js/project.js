// 設置進度條長度和更新顯示的百分比
document.addEventListener("DOMContentLoaded", () => {
  // 獲取所有進度條元素
  const progressBars = document.querySelectorAll(".progress-fill");

  // 遍歷每個進度條元素
  progressBars.forEach((bar) => {
    // 獲取progress屬性值
    const progressValue = bar.getAttribute("progress");

    // 如果存在progress屬性，則設置寬度
    if (progressValue) {
      // 設置進度條寬度為progress值的百分比
      bar.style.width = `${progressValue}%`;

      // 找到對應的百分比顯示元素並更新
      // 先找到父元素 (.progress-bar)，再往上找到包含 .progress-label 的祖先元素
      const progressBarContainer = bar.closest(".progress-bar");
      const progressLabelContainer =
        progressBarContainer.previousElementSibling;

      // 如果找到了進度標籤容器，更新其中的百分比顯示
      if (
        progressLabelContainer &&
        progressLabelContainer.classList.contains("progress-label")
      ) {
        const percentageDisplay =
          progressLabelContainer.querySelector("div:last-child");
        if (percentageDisplay) {
          percentageDisplay.textContent = `${progressValue}%`;
        }
      }
    }
  });

  // Initialize namespace for project editing
  window.projectEditing = window.projectEditing || {};
  window.projectEditing.members = [];

  // Function to update the project members list UI
  function updateProjectEditMembersUI() {
    const membersList = document.getElementById("editProjectMembersList");
    if (!membersList) return;

    membersList.innerHTML = "";

    window.projectEditing.members.forEach((member, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <div class="member-box">
                    <div>
                        <img src="${
                          member.photo || "/static/default-avatar.png"
                        }" class="user-photo">
                        <span class="user-name">${
                          member.name || member.username
                        }</span>
                        <span class="user-email">${member.email}</span>
                    </div>
                    <i class="fa-solid fa-xmark remove-project-member" data-index="${index}"></i>
                </div>
            `;
      membersList.appendChild(li);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll(".remove-project-member").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"), 10);
        window.projectEditing.members.splice(index, 1);
        updateProjectEditMembersUI();
      });
    });
  }

  // Function to close dialog with animation
  function closeDialogWithAnimation(dialog) {
    if (!dialog) return;
    dialog.setAttribute("closing", "");
    setTimeout(() => {
      dialog.removeAttribute("closing");
      dialog.close();
    }, 200); // Match CSS animation duration
  }

  const editButtons = document.querySelectorAll(".btn-edit");
  const editDialog = document.getElementById("editProjectDialog");
  const cancelEditButton = document.getElementById("cancelEditProjectBtn");
  const closeEditButton = document.getElementById("closeEditProjectBtn");
  const editProjectForm = document.getElementById("editProjectForm");

  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const projectId = button.getAttribute("data-project-id");

      // 獲取專案資料
      fetch(`/get_project_data/${projectId}/`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("無法獲取專案資料");
          }
          return response.json();
        })
        .then((data) => {
          // 填入表單數據 - using updated IDs
          document.getElementById("editProjectName").value = data.name;
          document.getElementById("editDescription").value = data.description;
          document.getElementById("editStartDate").value = formatDate(
            data.start_date
          );
          document.getElementById("editEndDate").value = formatDate(
            data.end_date
          );

          // 創建一個隱藏的項目ID字段
          let projectIdField = document.querySelector(
            'input[name="projectID"]'
          );
          if (!projectIdField) {
            projectIdField = document.createElement("input");
            projectIdField.type = "hidden";
            projectIdField.name = "projectID";
            editProjectForm.appendChild(projectIdField);
          }
          projectIdField.value = projectId;

          // Reset the members list for this project
          window.projectEditing.members = [];

          // Add members from the project data
          if (data.members && data.members.length > 0) {
            data.members.forEach((member) => {
              window.projectEditing.members.push({
                name: member.username,
                username: member.username,
                email: member.email,
                photo: member.photo || "/static/default-avatar.png",
              });
            });
          }

          // Update the members list UI
          updateProjectEditMembersUI();

          // 顯示編輯表單
          editDialog.showModal();
        })
        .catch((error) => {
          console.error("獲取專案資料時發生錯誤:", error);
          alert("獲取專案資料失敗");
        });
    });
  });

  // Close buttons event handlers
  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", () => {
      closeDialogWithAnimation(editDialog);
    });
  }

  if (closeEditButton) {
    closeEditButton.addEventListener("click", () => {
      closeDialogWithAnimation(editDialog);
    });
  }

  // Handle member adding button
  const openEditMemberBtn = document.getElementById("openEditMemberBtn");
  if (openEditMemberBtn) {
    openEditMemberBtn.addEventListener("click", function () {
      const editMemberDialog = document.getElementById("editMemberDialog");
      if (editMemberDialog) {
        // Set attribute to indicate this is for project editing
        editMemberDialog.setAttribute("data-referrer-dialog", "editProject");
        editMemberDialog.showModal();
      }
    });
  }

  // Handle form submission
  if (editProjectForm) {
    editProjectForm.addEventListener("submit", function (event) {
      // Add member information to form before submission
      window.projectEditing.members.forEach((member, index) => {
        const nameInput = document.createElement("input");
        nameInput.type = "hidden";
        nameInput.name = `member_name_${index}`;
        nameInput.value = member.name || member.username;

        const emailInput = document.createElement("input");
        emailInput.type = "hidden";
        emailInput.name = `member_email_${index}`;
        emailInput.value = member.email;

        this.appendChild(nameInput);
        this.appendChild(emailInput);
      });

      // Add member count
      const countInput = document.createElement("input");
      countInput.type = "hidden";
      countInput.name = "member_count";
      countInput.value = window.projectEditing.members.length;
      this.appendChild(countInput);
    });
  }

  // 輔助函數：格式化日期為 YYYY-MM-DD
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Project deletion functionality remains the same
  const deleteButtons = document.querySelectorAll(".btn-delete");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      Swal.fire({
        title: "您確定要刪除此專案嗎？",
        text: `此操作無法撤銷！`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "刪除",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.isConfirmed) {
          const csrftoken = document.querySelector(
            "[name=csrfmiddlewaretoken]"
          ).value;

          fetch(`/delete_project/`, {
            method: "POST",
            headers: {
              "X-CSRFToken": csrftoken,
            },
            body: new URLSearchParams({
              project_id: button.getAttribute("data-project-id"),
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                Swal.fire({
                  icon: "success",
                  title: "刪除成功",
                  text: "專案已成功刪除！",
                  target: document.getElementById("uploadFileDialog"),
                  draggable: true,
                }).then(() => {
                  location.reload();
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: "刪除失敗",
                  text: data.error || "伺服器錯誤，請稍後再試！",
                  target: document.getElementById("uploadFileDialog"),
                  draggable: true,
                });
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              Swal.fire({
                icon: "error",
                title: "刪除失敗",
                text: "伺服器錯誤，請稍後再試！",
                target: document.getElementById("uploadFileDialog"),
                draggable: true,
              });
            });
        }
      });
    });
  });

  // Create a function for the edit_member_dialog.js to access
  window.addMemberToEditProject = function (name, email, photo) {
    // Check if member already exists
    const existingMember = window.projectEditing.members.find(
      (m) => m.email === email
    );
    if (existingMember) return;

    // Add member to project editing array
    window.projectEditing.members.push({
      name: name,
      email: email,
      photo: photo || "/static/default-avatar.png",
    });

    // Update the UI
    updateProjectEditMembersUI();
  };
});
