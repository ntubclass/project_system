let searchTimeout;

/**
 * 初始化進度條動畫
 */
function initializeProgressBars() {
  const progressBars = document.querySelectorAll('.progress-fill[progress]');
  
  progressBars.forEach(bar => {
    const targetWidth = bar.getAttribute('progress') + '%';
    const progressPercentage = bar.parentElement.parentElement.querySelector('.progress-percentage');
    
    // 設置初始狀態
    bar.style.transition = 'none';
    bar.style.width = '0%';
    
    // 強制瀏覽器重新繪製
    bar.offsetWidth;
    
    // 延遲啟動動畫
    setTimeout(() => {
      bar.style.transition = 'width 0.3s ease';
      bar.style.width = targetWidth;
      
      // 延遲更新百分比文字以獲得更好的視覺效果
      if (progressPercentage) {
        setTimeout(() => {
          progressPercentage.style.opacity = '1';
        }, 100);
      }
    }, 50);
  });
}

/**
 * 任務管理頁面的搜尋和分頁功能
 */
function goToPage(page) {
  const url = new URL(window.location);
  url.searchParams.set("page", page);

  // 保持搜尋關鍵字
  const searchInput = document.querySelector(".search-input");
  if (searchInput && searchInput.value.trim()) {
    url.searchParams.set("search", searchInput.value.trim());
  }

  window.location.href = url.toString();
}

function performSearch(searchTerm) {
  const url = new URL(window.location);

  if (searchTerm && searchTerm.trim()) {
    url.searchParams.set("search", searchTerm.trim());
  } else {
    url.searchParams.delete("search");
  }

  // 搜尋時回到第一頁
  url.searchParams.delete("page");
  window.location.href = url.toString();
}

function filterTasks(searchTerm) {
  const tableBody = document.getElementById("taskTableBody");
  const rows = tableBody.querySelectorAll("tr");
  let visibleCount = 0;

  searchTerm = searchTerm.toLowerCase();

  rows.forEach((row) => {
    // Skip the "no data" row if present
    if (row.querySelector(".no-data")) {
      row.style.display = searchTerm ? "none" : "";
      return;
    }

    const projectName =
      row.querySelector(".project-name")?.textContent.toLowerCase() || "";
    const taskTitle =
      row.querySelector(".task-title")?.textContent.toLowerCase() || "";
    const userName =
      row.querySelector(".user-name")?.textContent.toLowerCase() || "";

    const isVisible =
      projectName.includes(searchTerm) ||
      taskTitle.includes(searchTerm) ||
      userName.includes(searchTerm);

    if (isVisible) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  // 隱藏分頁控制當使用前端搜尋時
  const paginationControls = document.querySelector(".pagination-controls");
  if (paginationControls) {
    paginationControls.style.display = searchTerm ? "none" : "";
  }
}

function initializeSearch() {
  const searchInput = document.querySelector(".search-input");
  if (!searchInput) return;

  // 載入頁面時設定搜尋值
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  if (searchParam) {
    searchInput.value = searchParam;
  }

  // 即時搜尋
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value;
    clearTimeout(searchTimeout);

    if (searchTerm.length === 0) {
      filterTasks("");
    } else if (searchTerm.length >= 2) {
      filterTasks(searchTerm);
    }
  });

  // Enter 鍵觸發後端搜尋
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(searchTimeout);
      performSearch(this.value);
    }
  });

  // 延遲後端搜尋（可選）
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value;
    clearTimeout(searchTimeout);

    if (searchTerm.length >= 3) {
      searchTimeout = setTimeout(() => {
        performSearch(searchTerm);
      }, 1000);
    }
  });
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

// 頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
  initializeProgressBars();
});
