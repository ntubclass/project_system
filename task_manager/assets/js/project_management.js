/**
 * 過濾專案列表函數
 * 根據搜尋輸入框的內容過濾專案表格
 */
function filterProjects() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#projectTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const name = row.querySelector('.project-name')?.textContent.toLowerCase() || '';
        const description = row.querySelector('.project-description')?.textContent.toLowerCase() || '';
        const manager = row.querySelector('.assignee-name')?.textContent.toLowerCase() || '';
        
        if (name.includes(input) || description.includes(input) || manager.includes(input)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 更新顯示的專案數量（如果有顯示元素的話）
    const showingCountElement = document.getElementById('showingCount');
    if (showingCountElement) {
        showingCountElement.textContent = visibleCount;
    }
}

/**
 * 設定狀態篩選
 * @param {HTMLElement} button - 被點擊的篩選按鈕
 * @param {string} status - 要篩選的狀態
 */
function setStatusFilter(button, status) {
    // 移除所有活躍狀態
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 設定當前按鈕為活躍
    button.classList.add('active');
    
    // 篩選專案
    const rows = document.querySelectorAll('#projectTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (status === 'all' || rowStatus === status) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 同時執行搜尋篩選
    if (document.getElementById('searchInput').value) {
        filterProjects();
    }
}

/**
 * 新增專案
 */
function addProject() {
    // TODO: 實作新增專案功能
    // 可以開啟模態框或導航到新增專案頁面
    if (confirm('即將導航到新增專案頁面，是否繼續？')) {
        // window.location.href = '/create_project/';
        alert('新增專案功能待實作');
    }
}

/**
 * 編輯專案
 * @param {number} projectId - 專案ID
 */
function editProject(projectId) {
    // TODO: 實作編輯專案功能
    // 可以開啟模態框或導航到編輯專案頁面
    if (confirm('即將導航到編輯專案頁面，是否繼續？')) {
        // window.location.href = `/edit_project/${projectId}/`;
        alert(`編輯專案功能待實作，專案ID: ${projectId}`);
    }
}

/**
 * 刪除專案
 * @param {number} projectId - 專案ID
 */
function deleteProject(projectId) {
    if (confirm('確定要刪除此專案嗎？此操作無法復原。')) {
        alert(`刪除專案功能待實作，專案ID: ${projectId}`);
    }
}

/**
 * 取得 CSRF Token（Django 需要）
 * @returns {string} CSRF Token
 */
function getCsrfToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

/**
 * 跳轉到指定頁面
 * @param {number} page - 頁碼
 */
function goToPage(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
}

/**
 * 重新整理專案列表並保持當前頁碼
 */
function refreshProjectList() {
    window.location.reload();
}

/**
 * 導航到專案詳情頁面
 * @param {number} projectId - 專案ID
 */
function viewProjectDetail(projectId) {
    window.location.href = `/project_detail/${projectId}/`;
}

// 綁定搜尋輸入框事件
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // 即時搜尋
        searchInput.addEventListener('input', filterProjects);
        searchInput.addEventListener('keyup', filterProjects);
        
        // 支援 Enter 鍵搜尋
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterProjects();
            }
        });
    }
    
    // 初始化篩選器狀態
    const activeTab = document.querySelector('.filter-tab.active');
    if (activeTab) {
        const status = activeTab.getAttribute('data-status');
        setStatusFilter(activeTab, status);
    }
});