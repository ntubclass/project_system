let searchTimeout;

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

function previousPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get("page")) || 1;

  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function nextPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get("page")) || 1;

  // 從 DOM 取得總頁數
  const paginationNumbers = document.querySelectorAll(".pagination-number");
  const totalPages =
    paginationNumbers.length > 0
      ? Math.max(
          ...Array.from(paginationNumbers).map((btn) =>
            parseInt(btn.textContent)
          )
        )
      : 1;

  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
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

function filterTable(searchTerm) {
  const tableBody = document.getElementById("messageTableBody");
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
    const userName =
      row.querySelector(".user-name")?.textContent.toLowerCase() || "";
    const userEmail =
      row.querySelector(".user-email")?.textContent.toLowerCase() || "";
    const messageContent =
      row.querySelector(".message-content")?.textContent.toLowerCase() || "";
    const messageTime =
      row.querySelector(".message-time")?.textContent.toLowerCase() || "";

    const isVisible =
      projectName.includes(searchTerm) ||
      userName.includes(searchTerm) ||
      userEmail.includes(searchTerm) ||
      messageContent.includes(searchTerm) ||
      messageTime.includes(searchTerm);

    if (isVisible) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  // 更新顯示數量
  const showingCount = document.getElementById("showingCount");
  if (showingCount) {
    showingCount.textContent = visibleCount;
  }

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
      // 清空搜尋時顯示所有項目
      filterTable("");
    } else if (searchTerm.length >= 2) {
      // 前端即時篩選
      filterTable(searchTerm);
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

// 實際刪除訊息的功能 (將來實作)
function deleteMessage(messageId) {
  Swal.fire({
    title: "確認刪除訊息",
    text: "您確定要刪除這條訊息嗎？此操作無法恢復。",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "刪除",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      const csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;
      const formData = new URLSearchParams();
      formData.append("message_id", messageId);

      fetch(window.location.pathname, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
        },
        body: formData,
      })
        .then((response) => {
          if (response.redirected) {
            window.location.href = response.url;
            return null;
          }
          return response.text();
        })
        .then((data) => {
          // 若有訊息可在此處理
          location.reload();
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
});
