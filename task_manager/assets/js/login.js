document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const loginContainer = document.getElementById('loginContainer');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordToggleIcon = document.getElementById('passwordToggleIcon');
    
    // 圓形元素
    const circles = document.querySelectorAll('.circle');
    
    // 追蹤滑鼠位置
    let mousePosition = { x: 0, y: 0 };
    
    // 追蹤輸入框焦點狀態
    let focusedInput = null;
    
    // 追蹤密碼顯示狀態
    let isPasswordVisible = false;
    
    // 監聽滑鼠移動
    document.addEventListener('mousemove', (e) => {
        if (loginContainer) {
            const rect = loginContainer.getBoundingClientRect();
            mousePosition = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // 移動背景圓形
            updateCirclePositions();
        }
    });
    
    // 更新圓形位置
    function updateCirclePositions() {
        circles[0].style.transform = `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`;
        circles[1].style.transform = `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`;
        circles[2].style.transform = `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`;
        circles[3].style.transform = `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`;
        circles[4].style.transform = `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`;
    }
    
    // 密碼顯示/隱藏切換功能
    if (passwordToggle && passwordInput && passwordToggleIcon) {
        passwordToggle.addEventListener('click', function() {
            isPasswordVisible = !isPasswordVisible;
            
            if (isPasswordVisible) {
                // 顯示密碼
                passwordInput.type = 'text';
                passwordToggleIcon.className = 'fas fa-eye-slash';
                passwordToggle.classList.add('active');
                passwordToggle.title = '隱藏密碼';
            } else {
                // 隱藏密碼
                passwordInput.type = 'password';
                passwordToggleIcon.className = 'fas fa-eye';
                passwordToggle.classList.remove('active');
                passwordToggle.title = '顯示密碼';
            }
            
            // 保持焦點在輸入框上
            passwordInput.focus();
        });
        
        // 設置初始的 title 屬性
        passwordToggle.title = '顯示密碼';
        
        // 防止密碼切換按鈕觸發表單提交
        passwordToggle.addEventListener('mousedown', function(e) {
            e.preventDefault();
        });
    }
    
    // 添加輸入框焦點效果
    if (emailInput) {
        emailInput.addEventListener('focus', () => {
            focusedInput = 'email';
            updateInputStyles();
        });
        
        emailInput.addEventListener('blur', () => {
            focusedInput = null;
            updateInputStyles();
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('focus', () => {
            focusedInput = 'password';
            updateInputStyles();
        });
        
        passwordInput.addEventListener('blur', () => {
            focusedInput = null;
            updateInputStyles();
        });
    }
    
    // 更新輸入框樣式
    function updateInputStyles() {
        // 電子郵件輸入框
        if (emailInput) {
            const emailIcon = emailInput.parentElement.querySelector('.input-icon');
            if (focusedInput === 'email') {
                emailInput.style.borderColor = '#3b82f6';
                emailInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                if (emailIcon) emailIcon.style.color = '#3b82f6';
            } else {
                emailInput.style.borderColor = '#cbd5e1';
                emailInput.style.boxShadow = 'none';
                if (emailIcon) emailIcon.style.color = '#94a3b8';
            }
        }
        
        // 密碼輸入框
        if (passwordInput) {
            const passwordIcon = passwordInput.parentElement.querySelector('.input-icon');
            if (focusedInput === 'password') {
                passwordInput.style.borderColor = '#3b82f6';
                passwordInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                if (passwordIcon) passwordIcon.style.color = '#3b82f6';
                // 當密碼框獲得焦點時，切換按鈕也變成藍色
                if (passwordToggle && !isPasswordVisible) {
                    passwordToggle.style.color = '#3b82f6';
                }
            } else {
                passwordInput.style.borderColor = '#cbd5e1';
                passwordInput.style.boxShadow = 'none';
                if (passwordIcon) passwordIcon.style.color = '#94a3b8';
                // 失去焦點時恢復切換按鈕顏色
                if (passwordToggle && !isPasswordVisible) {
                    passwordToggle.style.color = '#94a3b8';
                }
            }
        }
    }
    
    // 鍵盤快捷鍵支援
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Shift + P 切換密碼顯示
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            if (passwordToggle && document.activeElement === passwordInput) {
                passwordToggle.click();
            }
        }
        
        // ESC 鍵隱藏密碼（如果當前顯示）
        if (e.key === 'Escape' && isPasswordVisible) {
            passwordToggle.click();
        }
    });
    
    // 表單提交時的驗證
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // 基本驗證
            if (emailInput && !emailInput.value.trim()) {
                e.preventDefault();
                emailInput.focus();
                return false;
            }
            
            if (passwordInput && !passwordInput.value.trim()) {
                e.preventDefault();
                passwordInput.focus();
                return false;
            }
            
            // 提交前確保密碼是隱藏狀態
            if (isPasswordVisible && passwordToggle) {
                passwordToggle.click();
            }
        });
    }
    
    // 頁面載入時初始化
    updateInputStyles();
});