/**
 * 過濾訊息列表函數
 * 根據搜尋輸入框的內容過濾訊息表格
 */
function filterMessages() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#messageTableBody tr");
  let visibleCount = 0;

  rows.forEach((row) => {
    // 如果是空資料行，跳過
    if (row.querySelector(".no-data")) {
      return;
    }

    const projectName =
      row.querySelector(".project-name")?.textContent.toLowerCase() || "";
    const userName =
      row.querySelector(".user-name")?.textContent.toLowerCase() || "";
    const messageContent =
      row.querySelector(".message-content")?.textContent.toLowerCase() || "";

    if (
      projectName.includes(input) ||
      userName.includes(input) ||
      messageContent.includes(input)
    ) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });
}

/**
 * 設置時間過濾器
 */
function setMessageFilter(element, filter) {
  // 移除所有活動狀態
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // 設置當前活動狀態
  element.classList.add("active");

  const rows = document.querySelectorAll("#messageTableBody tr");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  rows.forEach((row) => {
    if (row.querySelector(".no-data")) {
      return;
    }

    const timeText = row.querySelector(".message-time")?.textContent;
    if (!timeText) return;

    // 解析時間格式 "YYYY-MM-DD HH:MM"
    const messageTime = new Date(timeText.replace(" ", "T"));
    let shouldShow = true;

    switch (filter) {
      case "today":
        shouldShow = messageTime >= today;
        break;
      case "week":
        shouldShow = messageTime >= weekAgo;
        break;
      case "all":
      default:
        shouldShow = true;
        break;
    }

    row.style.display = shouldShow ? "" : "none";
  });
}

/**
 * 顯示刪除提示
 */
function showDeleteAlert() {
  document.getElementById("deleteModal").style.display = "flex";
}

/**
 * 關閉刪除彈窗
 */
function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
}

/**
 * 點擊外部關閉彈窗
 */
window.onclick = function (event) {
  const modal = document.getElementById("deleteModal");
  if (event.target === modal) {
    closeDeleteModal();
  }
};

// DOM 載入完成後的初始化
document.addEventListener("DOMContentLoaded", function () {
  // 綁定搜尋輸入框事件
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterMessages);
    searchInput.addEventListener("keyup", filterMessages);
  }

  // 初始化時如果有搜尋參數，執行過濾
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  if (searchParam && searchInput) {
    searchInput.value = searchParam;
    filterMessages();
  }
});
