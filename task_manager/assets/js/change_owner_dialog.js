// 更換專案所有者功能 (搜尋方式，參考add_member_dialog)
class ChangeOwnerDialog {
    constructor() {
        this.dialog = document.getElementById('changeOwnerDialog');
        this.form = document.getElementById('changeOwnerForm');
        this.searchInput = document.getElementById('newOwnerSearch');
        this.resultsContainer = document.getElementById('newOwnerResults');
        this.selectedOwnerGroup = document.getElementById('selectedOwnerGroup');
        this.selectedOwnerInfo = document.getElementById('selectedOwnerInfo');
        this.confirmBtn = document.getElementById('confirmChangeOwner');
        
        this.currentProjectId = null;
        this.currentOwnerId = null;
        this.selectedNewOwner = null;
        this.triggerButton = null; // 記錄觸發對話框的按鈕
        
        this.init();
    }

    init() {
        if (!this.dialog || !this.form) {
            console.error('更換所有者對話框元素未找到');
            return;
        }
        
        this.bindEvents();
    }

    bindEvents() {
        // 關閉對話框事件
        const closeBtn = document.getElementById('closeChangeOwnerDialog');
        const cancelBtn = document.getElementById('cancelChangeOwner');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // 點擊對話框外部關閉
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close();
            }
        });

        // 搜尋輸入事件
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.trim()) {
                    this.resultsContainer.classList.add('show');
                }
            });

            // 清除選擇時重新啟用搜尋
            this.searchInput.addEventListener('keydown', (e) => {
                if (this.selectedNewOwner && e.key === 'Backspace') {
                    this.clearSelection();
                }
            });
        }

        // 清除選擇按鈕
        const clearBtn = document.getElementById('clearSelectedOwner');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSelection());
        }

        // ESC 鍵關閉對話框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog.open) {
                this.close();
            }
        });

        // 點擊外部關閉搜尋結果
        document.addEventListener('click', (e) => {
            if (!this.searchInput?.contains(e.target) && !this.resultsContainer?.contains(e.target)) {
                this.resultsContainer?.classList.remove('show');
            }
        });
    }

    async handleSearchInput(query) {
        // 清除錯誤訊息
        this.clearError('newOwnerError');
        
        // 如果已選中使用者，不處理搜尋
        if (this.selectedNewOwner) {
            return;
        }

        // 清空結果如果查詢為空
        if (!query.trim()) {
            this.resultsContainer.innerHTML = '';
            this.resultsContainer.classList.remove('show');
            return;
        }

        // 查詢長度至少2個字元
        if (query.length < 2) {
            return;
        }

        try {
            // 獲取CSRF token
            const csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
            if (!csrfTokenElement) {
                throw new Error('CSRF token 未找到');
            }
            const csrfToken = csrfTokenElement.value;

            // 使用與 add_member_dialog.js 相同的API
            const response = await fetch('/dynamic_search_member/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    search_query: query,
                    project_id: null,
                    is_member_list: false,
                    for_change_owner: true // 標記這是更換所有者的搜尋
                })
            });

            if (!response.ok) {
                throw new Error('搜尋請求失敗');
            }

            const data = await response.json();
            const users = data.user_data || [];

            this.displaySearchResults(users);

        } catch (error) {
            console.error('搜尋用戶時發生錯誤:', error);
            this.displaySearchResults([]);
        }
    }

    displaySearchResults(users) {
        this.resultsContainer.innerHTML = '';

        if (users.length > 0) {
            // 過濾掉目前的專案所有者
            const filteredUsers = users.filter(user => 
                (user.id || user.user_id) != this.currentOwnerId
            );

            if (filteredUsers.length > 0) {
                // 限制最多顯示5個結果
                const limitedUsers = filteredUsers.slice(0, 5);
                
                limitedUsers.forEach(user => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <img src="${this.getPhotoUrl(user.photo)}" class="user-photo" alt="用戶頭像">
                        <div class="user-info">
                            <span class="user-name">${user.name || user.username}</span>
                            <span class="user-email">${user.email}</span>
                        </div>
                    `;
                    
                    li.addEventListener('click', () => {
                        this.selectUser(user);
                    });
                    
                    this.resultsContainer.appendChild(li);
                });
                
                // 如果有更多結果，顯示提示
                if (filteredUsers.length > 5) {
                    const moreInfo = document.createElement('li');
                    moreInfo.className = 'more-results-info';
                    moreInfo.innerHTML = `
                        <div class="more-info">
                            <i class="fas fa-info-circle"></i>
                            <span>還有 ${filteredUsers.length - 5} 個更多結果，請輸入更具體的關鍵字</span>
                        </div>
                    `;
                    this.resultsContainer.appendChild(moreInfo);
                }
            } else {
                this.showNoResults('目前專案所有者無法選擇自己');
            }
        } else {
            this.showNoResults('沒有找到符合的使用者');
        }

        this.resultsContainer.classList.add('show');
        
    }

    showNoResults(message) {
        const li = document.createElement('li');
        li.className = 'no-results';
        li.textContent = message;
        this.resultsContainer.appendChild(li);
    }

    selectUser(user) {
        this.selectedNewOwner = {
            id: user.id || user.user_id,
            name: user.name || user.username,
            email: user.email,
            photo: user.photo
        };

        // 隱藏整個搜尋區域，顯示選中的使用者
        const searchOwnerGroup = document.getElementById('searchOwnerGroup');
        const selectedOwnerGroup = document.getElementById('selectedOwnerGroup');
        
        if (searchOwnerGroup) {
            searchOwnerGroup.style.display = 'none';
        }
        
        this.resultsContainer.classList.remove('show');
        selectedOwnerGroup.style.display = 'block';

        // 設置隱藏欄位的值
        document.getElementById('selectedNewOwnerId').value = this.selectedNewOwner.id;

        // 顯示選中的使用者資訊
        this.selectedOwnerInfo.innerHTML = `
            <img src="${this.getPhotoUrl(this.selectedNewOwner.photo)}" class="user-photo" alt="選中用戶頭像">
            <div class="user-info">
                <span class="user-name">${this.selectedNewOwner.name}</span>
                <span class="user-email">${this.selectedNewOwner.email}</span>
            </div>
        `;

        // 啟用確認按鈕
        this.confirmBtn.disabled = false;

        // 清除錯誤訊息
        this.clearError('newOwnerError');
    }

    clearSelection() {
        this.selectedNewOwner = null;
        
        // 重新顯示搜尋區域，隱藏選中的使用者
        const searchOwnerGroup = document.getElementById('searchOwnerGroup');
        const selectedOwnerGroup = document.getElementById('selectedOwnerGroup');
        
        if (searchOwnerGroup) {
            searchOwnerGroup.style.display = 'block';
        }
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        selectedOwnerGroup.style.display = 'none';
        
        // 清除隱藏欄位
        document.getElementById('selectedNewOwnerId').value = '';
        
        // 禁用確認按鈕
        this.confirmBtn.disabled = true;
        
        // 聚焦到搜尋框
        setTimeout(() => {
            if (this.searchInput) {
                this.searchInput.focus();
            }
        }, 100);
    }

    getPhotoUrl(photo) {
        return photo || '/static/default-avatar.png';
    }    open(projectId, projectName, currentOwnerName, currentOwnerId, triggerButton = null) {
        this.currentProjectId = projectId;
        this.currentOwnerId = currentOwnerId;
        this.triggerButton = triggerButton; // 儲存觸發按鈕的引用
        
        // 填入表單資料
        this.setFormValue('changeOwnerProjectId', projectId);
        this.setFormValue('changeOwnerProjectName', projectName);
        this.setFormValue('currentOwnerName', currentOwnerName);
        this.setFormValue('currentOwnerId', currentOwnerId);
        
        // 重置表單狀態
        this.resetForm();
        
        // 顯示對話框
        this.dialog.showModal();
        
        //聚焦到搜尋框
        setTimeout(() => {
            if (this.searchInput) {
                this.searchInput.focus();
            }
        }, 100);
    }    close() {
        if (this.dialog.open) {
            this.closeDialogWithAnimation();
        }
        this.currentProjectId = null;
        this.currentOwnerId = null;
        this.resetForm();
        
        // 移除任何聚焦狀態，避免按鈕保持藍色框框
        setTimeout(() => {
            // 優先移除觸發按鈕的焦點
            if (this.triggerButton && this.triggerButton.blur) {
                this.triggerButton.blur();
            }
            
            // 移除所有 btn-change-owner 按鈕的焦點
            const changeOwnerButtons = document.querySelectorAll('.btn-change-owner');
            changeOwnerButtons.forEach(btn => {
                if (btn.blur) {
                    btn.blur();
                }
            });
            
            // 也移除當前活動元素的焦點
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
            
            // 將焦點移到 body，確保沒有元素保持焦點
            document.body.focus();
            
            // 清除觸發按鈕的引用
            this.triggerButton = null;
        }, 250); // 稍微延遲以確保對話框完全關閉
    }

    closeDialogWithAnimation() {
        this.dialog.setAttribute('closing', '');
        setTimeout(() => {
            this.dialog.removeAttribute('closing');
            this.dialog.close();
        }, 200);
    }

    setFormValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    resetForm() {
        // 清除選擇狀態
        this.clearSelection();
        
        // 清除所有錯誤訊息
        this.clearAllErrors();
        
        // 清空搜尋結果
        this.resultsContainer.innerHTML = '';
        this.resultsContainer.classList.remove('show');
        
        // 重置提交按鈕
        this.confirmBtn.disabled = true;
        this.confirmBtn.classList.remove('loading');
        this.confirmBtn.textContent = '確認更換';
        
        // 注意：不要重置整個表單，因為我們需要保留專案資訊
        // 只重置搜尋相關的欄位
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        document.getElementById('selectedNewOwnerId').value = '';
    }

    validateForm() {
        this.clearAllErrors();

        if (!this.selectedNewOwner) {
            this.showError('newOwnerError', '請選擇新的專案所有者');
            return false;
        }

        if (this.selectedNewOwner.id == this.currentOwnerId) {
            this.showError('newOwnerError', '新所有者不能與目前所有者相同');
            return false;
        }

        return true;
    }

    clearError(errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
            errorElement.removeAttribute('role');
        }
    }

    clearAllErrors() {
        const errorElements = this.form.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.classList.remove('show');
            element.textContent = '';
            element.removeAttribute('role');
        });
    }

    showError(errorElementId, message) {
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            errorElement.setAttribute('role', 'alert');
        }
    }

    showSuccessMessage(message) {
        // 移除現有的成功訊息
        const existingMessage = document.querySelector('.success-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 創建新的成功訊息
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 設置樣式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '10001',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });

        toast.querySelector('.toast-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        document.body.appendChild(toast);

        // 動畫顯示
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // 自動移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// 全域變數和初始化
let changeOwnerDialog;

document.addEventListener('DOMContentLoaded', function() {
    // 初始化更換所有者對話框
    changeOwnerDialog = new ChangeOwnerDialog();
    
    // 綁定更換所有者按鈕事件
    bindChangeOwnerButtons();
});

function bindChangeOwnerButtons() {
    // 使用事件委派處理動態生成的按鈕
    document.addEventListener('click', function(e) {
        const changeOwnerBtn = e.target.closest('.btn-change-owner');
        
        if (changeOwnerBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const projectId = changeOwnerBtn.getAttribute('data-project-id');
            const row = changeOwnerBtn.closest('tr');
            
            if (row && projectId) {
                const projectName = row.querySelector('.project-name')?.textContent?.trim() || '';
                const ownerText = row.querySelector('.assignee-name')?.textContent || '';
                const currentOwnerName = ownerText.replace('負責人: ', '').trim();
                  // 獲取完整的專案所有者資訊
                getProjectOwnerInfo(projectId)
                    .then(ownerInfo => {
                        
                        if (ownerInfo && changeOwnerDialog) {
                            changeOwnerDialog.open(
                                projectId, 
                                projectName, 
                                ownerInfo.owner_name, 
                                ownerInfo.owner_id,
                                changeOwnerBtn // 傳遞觸發按鈕的引用
                            );
                        } else {
                            console.error('無法獲取專案所有者資訊');
                            // 使用頁面上的資訊作為備用
                            if (changeOwnerDialog) {
                                changeOwnerDialog.open(
                                    projectId, 
                                    projectName, 
                                    currentOwnerName, 
                                    null, // 暫時沒有ID，會在後續處理
                                    changeOwnerBtn // 傳遞觸發按鈕的引用
                                );
                            }
                        }
                    })
                    .catch(error => {
                        console.error('獲取專案所有者資訊失敗:', error);
                        // 使用頁面上的資訊作為備用
                        if (changeOwnerDialog) {
                            changeOwnerDialog.open(
                                projectId, 
                                projectName, 
                                currentOwnerName, 
                                null,
                                changeOwnerBtn // 傳遞觸發按鈕的引用
                            );
                        }
                    });
            }
        }
    });
}

async function getProjectOwnerInfo(projectId) {
    try {
        // 獲取CSRF token
        const csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
        const csrfToken = csrfTokenElement ? csrfTokenElement.value : '';

        // 使用現有的 get_project_data API (已修改為包含owner資訊)
        const response = await fetch(`/get_project_data/${projectId}/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.owner && data.owner_id) {
                
                return {
                    owner_id: data.owner_id,
                    owner_name: data.owner,
                    owner_full_name: data.owner,
                    project_data: data
                };
            }
        }
    } catch (error) {
        console.error('API請求失敗:', error);
    }
    return null;
}

// 輔助函數：通過使用者名稱獲取使用者ID
async function getUserIdByUsername(username) {
    if (!username) return null;
    
    try {
        const csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
        const csrfToken = csrfTokenElement ? csrfTokenElement.value : '';

        // 使用搜尋API來找到使用者
        const response = await fetch('/dynamic_search_member/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                search_query: username,
                project_id: null,
                is_member_list: false
            })
        });

        if (response.ok) {
            const data = await response.json();
            const users = data.user_data || [];
            
            // 找到完全匹配的使用者
            const matchedUser = users.find(user => 
                (user.name === username || user.username === username)
            );
            
            return matchedUser ? (matchedUser.id || matchedUser.user_id) : null;
        }
    } catch (error) {
        console.error('獲取使用者ID失敗:', error);
    }
    
    return null;
}