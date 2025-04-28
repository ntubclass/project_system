document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const optionItems = document.querySelectorAll('.option[data-target]');
    const logoutOption = document.getElementById('logoutOption');
    const openUploadAvatarBtn = document.getElementById('openUploadAvatar');
    const closeUploadAvatarBtn = document.getElementById('closeUploadAvatar');
    const uploadAvatarDialog = document.getElementById('UploadAvatarDialog');  // 確保使用正確的ID
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    
    // 處理表單切換功能
    optionItems.forEach(option => {
        option.addEventListener('click', function(e) {
            const targetId = this.getAttribute('data-target');
            
            // 移除所有選項的active類
            optionItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // 給當前選項添加active類
            this.classList.add('active');
            
            // 隱藏所有表單
            profileForm.style.display = 'none';
            passwordForm.style.display = 'none';
            
            // 顯示對應的表單
            document.getElementById(targetId).style.display = 'flex';
        });
    });
    
    // 退出登錄選項點擊事件 - 直接登出，不顯示確認對話框
    if (logoutOption) {
        logoutOption.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 直接跳轉到登出路由
            window.location.href = '/logout/';
        });
    }
    
    // 頭像上傳對話框功能
    if (openUploadAvatarBtn && uploadAvatarDialog) {
        openUploadAvatarBtn.addEventListener('click', function() {
            uploadAvatarDialog.showModal();
        });
    } else {
        console.error('頭像上傳按鈕或對話框不存在:', {
            'openUploadAvatarBtn': openUploadAvatarBtn, 
            'uploadAvatarDialog': uploadAvatarDialog
        });
    }
    
    if (closeUploadAvatarBtn && uploadAvatarDialog) {
        closeUploadAvatarBtn.addEventListener('click', function() {
            uploadAvatarDialog.close();
        });
    }
    
    // 當點擊對話框背景時關閉對話框
    if (uploadAvatarDialog) {
        uploadAvatarDialog.addEventListener('click', function(e) {
            if (e.target === uploadAvatarDialog) {
                uploadAvatarDialog.close();
            }
        });
    }
    
    // 基本資料表單驗證
    const profileFormEl = document.querySelector('#profile-form form');
    if (profileFormEl) {
        profileFormEl.addEventListener('submit', function(e) {
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            
            // 檢查姓名是否為空
            if (!nameInput.value.trim()) {
                e.preventDefault();
                alert('姓名不能為空');
                nameInput.focus();
                return false;
            }
            
            // 檢查郵箱格式
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value.trim())) {
                e.preventDefault();
                alert('請輸入有效的電子郵箱');
                emailInput.focus();
                return false;
            }
            
            // 檢查手機格式（台灣手機號格式）
            const phonePattern = /^09\d{8}$/;
            if (!phonePattern.test(phoneInput.value.trim())) {
                e.preventDefault();
                alert('請輸入有效的手機號碼格式（例如：0912345678）');
                phoneInput.focus();
                return false;
            }
        });
    }

    // 密碼驗證
    const passwordFormEl = document.querySelector('#password-form form');
    if (passwordFormEl) {
        passwordFormEl.addEventListener('submit', function(e) {
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            if (newPassword !== confirmPassword) {
                e.preventDefault();
                alert('兩次輸入的密碼不一致，請重新輸入');
                return false;
            }
            
            if (newPassword.length < 8) {
                e.preventDefault();
                alert('密碼長度至少需要8個字符');
                return false;
            }
        });
    }
});

// 頭像預覽功能
function previewAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('avatarPreview').src = e.target.result;
            // 同時更新用戶頭像預覽
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                userAvatar.src = e.target.result;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}