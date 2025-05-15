// 設置進度條長度和更新顯示的百分比
document.addEventListener('DOMContentLoaded', () => {
    // 獲取所有進度條元素
    const progressBars = document.querySelectorAll('.progress-fill');
    
    // 遍歷每個進度條元素
    progressBars.forEach(bar => {
        // 獲取progress屬性值
        const progressValue = bar.getAttribute('progress');
        
        // 如果存在progress屬性，則設置寬度
        if (progressValue) {
            // 設置進度條寬度為progress值的百分比
            bar.style.width = `${progressValue}%`;
            
            // 找到對應的百分比顯示元素並更新
            // 先找到父元素 (.progress-bar)，再往上找到包含 .progress-label 的祖先元素
            const progressBarContainer = bar.closest('.progress-bar');
            const progressLabelContainer = progressBarContainer.previousElementSibling;
            
            // 如果找到了進度標籤容器，更新其中的百分比顯示
            if (progressLabelContainer && progressLabelContainer.classList.contains('progress-label')) {
                const percentageDisplay = progressLabelContainer.querySelector('div:last-child');
                if (percentageDisplay) {
                    percentageDisplay.textContent = `${progressValue}%`;
                }
            }
        }
    });

    const editButtons = document.querySelectorAll('.btn-edit');
    const editForm = document.getElementById('editProjectDialog');
    const cancelButton = document.getElementById('cancelProjectBtn');
    const closeButton = document.getElementById('closeProjectBtn');
    const editProjectForm = document.getElementById('editProjectForm');
    
    editButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const projectId = button.getAttribute('data-project-id');
            
            // 獲取專案資料
            fetch(`/get_project_data/${projectId}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('無法獲取專案資料');
                    }
                    return response.json();
                })
                .then(data => {
                    // 填入表單數據
                    document.getElementById('projectName').value = data.name;
                    document.getElementById('description').value = data.description;
                    document.getElementById('startDate').value = formatDate(data.start_date);
                    document.getElementById('dueDate').value = formatDate(data.end_date);
                    
                    // 創建一個隱藏的項目ID字段
                    let projectIdField = document.querySelector('input[name="projectID"]');
                    if (!projectIdField) {
                        projectIdField = document.createElement('input');
                        projectIdField.type = 'hidden';
                        projectIdField.name = 'projectID';
                        editProjectForm.appendChild(projectIdField);
                    }
                    projectIdField.value = projectId;
                    
                    // 處理成員資料
                    const membersList = document.getElementById('membersList');
                    membersList.innerHTML = '';
                    
                    let memberCount = 0;
                    if (data.members && data.members.length > 0) {
                        data.members.forEach((member, index) => {
                            add_existing_member(member.username, member.email, member.photo);
                            const memberItem = document.createElement('div');
                            memberItem.className = 'member-item';
                            memberItem.innerHTML = `
                            <div>
                                <img src="${member.photo}" class="user-photo">
                                <span>${member.username}</span>
                                <span class="user-email">${member.email}</span>
                            </div>
                            `;
                            membersList.appendChild(memberItem);
                            memberCount++;
                        });
                    }
                    
                    // 添加成員計數字段
                    let memberCountField = document.querySelector('input[name="member_count"]');
                    if (!memberCountField) {
                        memberCountField = document.createElement('input');
                        memberCountField.type = 'hidden';
                        memberCountField.name = 'member_count';
                        editProjectForm.appendChild(memberCountField);
                    }
                    memberCountField.value = memberCount;
                    
                    // 添加移除成員的事件處理
                    const removeButtons = membersList.querySelectorAll('.remove-member-btn');
                    removeButtons.forEach(btn => {
                        btn.addEventListener('click', function() {
                            const memberItem = this.closest('.member-item');
                            memberItem.remove();
                            
                            // 重新組織成員索引和計數
                            updateMembersIndexes();
                        });
                    });
                    
                    // 顯示編輯表單
                    editForm.showModal();
                })
                .catch(error => {
                    console.error('獲取專案資料時發生錯誤:', error);
                    alert('獲取專案資料失敗');
                });
            
            // 綁定取消和關閉按鈕的事件
            const closeDialog = () => {
                editForm.close();
                // 移除事件處理器，防止重複綁定
                cancelButton.removeEventListener('click', closeDialog);
                closeButton.removeEventListener('click', closeDialog);
            };
            
            cancelButton.addEventListener('click', closeDialog);
            closeButton.addEventListener('click', closeDialog);
        });
    });
    
    // 處理添加成員按鈕
    const openEditAddMemberBtn = document.getElementById('openEditAddMemberBtn');
    if (openEditAddMemberBtn) {
        openEditAddMemberBtn.addEventListener('click', function() {
            // 這裡可以打開新增成員對話框
            // 假設已有這個功能的對話框
            const addMemberDialog = document.getElementById('addMemberDialog');
            if (addMemberDialog) {
                addMemberDialog.showModal();
            }
        });
    }
    
    // 輔助函數：格式化日期為 YYYY-MM-DD
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 輔助函數：更新成員索引
    function updateMembersIndexes() {
        const memberItems = document.querySelectorAll('.member-item');
        let memberCount = 0;
        
        memberItems.forEach((item, index) => {
            const nameInput = item.querySelector('input[name^="member_name_"]');
            const emailInput = item.querySelector('input[name^="member_email_"]');
            
            if (nameInput && emailInput) {
                const username = nameInput.value;
                const email = emailInput.value;
                
                nameInput.name = `member_name_${index}`;
                emailInput.name = `member_email_${index}`;
                
                memberCount++;
            }
        });
        
        // 更新成員計數
        const memberCountField = document.querySelector('input[name="member_count"]');
        if (memberCountField) {
            memberCountField.value = memberCount;
        }
    }
});