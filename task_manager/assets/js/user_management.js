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

// 刪除用戶功能
function deleteUser(userId) {
    const userRow = document.querySelector(`tr[data-user] [onclick*='deleteUser(${userId})']`).closest('tr');
    const userName = userRow ? userRow.querySelector('.user-name')?.textContent : '';
    Swal.fire({
        title: '確認刪除用戶',
        text: userName ? `您確定要刪除用戶「${userName}」嗎？此操作無法還原。` : '您確定要刪除此用戶嗎？此操作無法還原。',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
        confirmButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
            // 請根據實際API路徑與CSRF設計
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
            fetch(`/delete_user/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `user_id=${userId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '刪除成功',
                        text: '用戶已成功刪除！',
                    }).then(() => location.reload());
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: '刪除失敗',
                        text: data.error || '伺服器錯誤，請稍後再試！',
                    });
                }
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: '刪除失敗',
                    text: '伺服器錯誤，請稍後再試！',
                });
            });
        }
    });
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