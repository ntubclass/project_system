/**
 * 過濾使用者列表函數
 * 根據搜尋輸入框的內容過濾使用者表格
 */
function filterUsers() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const name = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const email = row.querySelector('.user-email')?.textContent.toLowerCase() || '';
        
        if (name.includes(input) || email.includes(input)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 更新顯示的使用者數量
    const showingCountElement = document.getElementById('showingCount');
    if (showingCountElement) {
        showingCountElement.textContent = visibleCount;
    }
}

// DOM 載入完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 綁定搜尋輸入框事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
        searchInput.addEventListener('keyup', filterUsers);
    }
});