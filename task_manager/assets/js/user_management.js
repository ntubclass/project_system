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
        title: '確認停用用戶',
        text: userName ? `您確定要停用用戶「${userName}」嗎？停用後該用戶將無法登入。` : '您確定要停用此用戶嗎？停用後該用戶將無法登入。',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '停用',
        cancelButtonText: '取消',
        confirmButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
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
                    // 只更新該行狀態，不刷新整頁
                    if (userRow) {
                        // 狀態 badge
                        const statusBadge = userRow.querySelector('.status-badge');
                        if (statusBadge) {
                            statusBadge.className = 'status-badge activity-offline';
                            statusBadge.textContent = '停用';
                        }
                        // 狀態屬性
                        userRow.setAttribute('data-status', 'disabled');
                        // 按鈕切換為啟用
                        const actionsDiv = userRow.querySelector('.actions');
                        if (actionsDiv) {
                            actionsDiv.innerHTML = `
                                <button type="button" class="action-btn edit" onclick="editUser(${userId})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="action-btn delete" onclick="enableUser(${userId})" title="啟用用戶">
                                    <i class="fas fa-user-check"></i> 啟用
                                </button>
                            `;
                        }
                    }
                    Swal.fire({
                        icon: 'success',
                        title: '停用成功',
                        text: '用戶已被成功停用！',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: '停用失敗',
                        text: data.error || '伺服器錯誤，請稍後再試！',
                    });
                }
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: '停用失敗',
                    text: '伺服器錯誤，請稍後再試！',
                });
            });
        }
    });
}

// 編輯用戶功能
function editUser(userId) {
    let isSuperUser = window.isSuperUser;
    if (typeof isSuperUser === 'string') {
        isSuperUser = isSuperUser === 'true' || isSuperUser === true;
    }
    // 取得該用戶資料
    const row = document.querySelector(`#userTableBody tr [onclick*='editUser(${userId})']`).closest('tr');
    if (!row) {
        Swal.fire({
            icon: 'error',
            title: '找不到用戶資料',
            text: '請重新整理頁面後再試。',
        });
        return;
    }
    const name = row.querySelector('.user-name')?.childNodes[0]?.textContent?.trim() || '';
    const email = row.querySelector('.user-email')?.textContent?.trim() || '';
    const role = row.getAttribute('data-role') || '';
    const status = row.getAttribute('data-status') || '';

    // 只有超級管理員可以編輯其他超級管理員
    if (role === '專案管理者' && !isSuperUser) {
        Swal.fire({
            icon: 'info',
            title: '無法編輯超級管理員',
            text: '只有超級管理員可以編輯其他超級管理員。',
        });
        return;
    }
    // 防呆：確認所有欄位都存在
    if (!document.getElementById('editUserId') || !document.getElementById('editUserName') || !document.getElementById('editUserEmail') || !document.getElementById('editUserRole') || !document.getElementById('editUserStatus')) {
        Swal.fire({
            icon: 'error',
            title: '找不到編輯表單欄位',
            text: '請確認 edit_user_dialog.html 已正確引入於頁面底部。',
        });
        return;
    }
    document.getElementById('editUserId').value = userId;
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserRole').value = role;
    document.getElementById('editUserStatus').value = status;
    document.getElementById('editUserName').removeAttribute('readonly');
    document.getElementById('editUserEmail').removeAttribute('readonly');
    document.getElementById('editUserRole').removeAttribute('disabled');
    document.getElementById('editUserStatus').removeAttribute('disabled');
    document.getElementById('editUserDialog').showModal();
}

// 關閉編輯對話框
const closeEditUserBtn = document.getElementById('closeEditUserBtn');
const cancelEditUserBtn = document.getElementById('cancelEditUserBtn');
if (closeEditUserBtn) closeEditUserBtn.onclick = () => document.getElementById('editUserDialog').close();
if (cancelEditUserBtn) cancelEditUserBtn.onclick = () => document.getElementById('editUserDialog').close();

// 表單送出
const editUserForm = document.getElementById('editUserForm');
if (editUserForm) {
    editUserForm.onsubmit = function(e) {
        e.preventDefault();
        const userId = document.getElementById('editUserId').value;
        const status = document.getElementById('editUserStatus').value;
        const role = document.getElementById('editUserRole').value;
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        fetch('/edit_user/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `user_id=${userId}&status=${status}&role=${role}`
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // 直接更新畫面，不重整
                // 1. 關閉 dialog
                document.getElementById('editUserDialog').close();
                // 2. 更新表格內容
                const row = document.querySelector(`#userTableBody tr [onclick*='editUser(${userId})']`).closest('tr');
                if (row) {
                    row.querySelector('.user-name').childNodes[0].textContent = document.getElementById('editUserName').value;
                    row.querySelector('.user-email').textContent = document.getElementById('editUserEmail').value;
                    row.setAttribute('data-role', role);
                    row.setAttribute('data-status', status);
                    // 更新角色顯示
                    const superAdminSpan = row.querySelector('.user-name span');
                    if (role === '專案管理者') {
                        if (!superAdminSpan) {
                            const span = document.createElement('span');
                            span.style.color = '#eab308';
                            span.style.fontSize = '12px';
                            span.style.fontWeight = '600';
                            span.style.marginLeft = '6px';
                            span.textContent = '超級管理員';
                            row.querySelector('.user-name').appendChild(span);
                        }
                    } else {
                        if (superAdminSpan) superAdminSpan.remove();
                    }
                    // 更新狀態 badge
                    const statusBadge = row.querySelector('.status-badge');
                    if (statusBadge) {
                        if (status === 'active') {
                            statusBadge.className = 'status-badge activity-online';
                            statusBadge.textContent = '啟用';
                        } else {
                            statusBadge.className = 'status-badge activity-offline';
                            statusBadge.textContent = '停用';
                        }
                    }
                }
                Swal.fire({ icon: 'success', title: '更新成功', text: '用戶狀態已更新' });
            } else {
                document.getElementById('editUserFormErrors').textContent = data.error || '更新失敗';
            }
        })
        .catch(() => {
            document.getElementById('editUserFormErrors').textContent = '伺服器錯誤，請稍後再試！';
        });
    };
}

// 啟用用戶功能
function enableUser(userId) {
    const userRow = document.querySelector(`tr[data-user] [onclick*='enableUser(${userId})']`).closest('tr');
    const userName = userRow ? userRow.querySelector('.user-name')?.textContent : '';
    Swal.fire({
        title: '確認啟用用戶',
        text: userName ? `您確定要啟用用戶「${userName}」嗎？` : '您確定要啟用此用戶嗎？',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '啟用',
        cancelButtonText: '取消',
        confirmButtonColor: '#059669',
    }).then((result) => {
        if (result.isConfirmed) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
            fetch('/edit_user/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `user_id=${userId}&status=active`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 只更新該行狀態，不刷新整頁
                    if (userRow) {
                        // 狀態 badge
                        const statusBadge = userRow.querySelector('.status-badge');
                        if (statusBadge) {
                            statusBadge.className = 'status-badge activity-online';
                            statusBadge.textContent = '啟用';
                        }
                        // 狀態屬性
                        userRow.setAttribute('data-status', 'active');
                        // 按鈕切換為停用
                        const actionsDiv = userRow.querySelector('.actions');
                        if (actionsDiv) {
                            actionsDiv.innerHTML = `
                                <button type="button" class="action-btn edit" onclick="editUser(${userId})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="action-btn delete" onclick="deleteUser(${userId})" title="停用用戶">
                                    <i class="fas fa-user-slash"></i> 停用
                                </button>
                            `;
                        }
                    }
                    Swal.fire({
                        icon: 'success',
                        title: '啟用成功',
                        text: '用戶已被成功啟用！',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: '啟用失敗',
                        text: data.error || '伺服器錯誤，請稍後再試！',
                    });
                }
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: '啟用失敗',
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
    // 修正 window.isSuperUser 判斷（確保全域變數正確）
    if (typeof window.isSuperUser === 'string') {
        window.isSuperUser = window.isSuperUser === 'true';
    }
});