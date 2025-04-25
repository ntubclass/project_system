document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const loginContainer = document.getElementById('loginContainer');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    
    // 圓形元素
    const circles = document.querySelectorAll('.circle');
    
    // 追蹤滑鼠位置
    let mousePosition = { x: 0, y: 0 };
    
    // 追蹤輸入框焦點狀態
    let focusedInput = null;
    
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
    
    // 添加輸入框焦點效果
    emailInput.addEventListener('focus', () => {
        focusedInput = 'email';
        updateInputStyles();
    });
    
    emailInput.addEventListener('blur', () => {
        focusedInput = null;
        updateInputStyles();
    });
    
    passwordInput.addEventListener('focus', () => {
        focusedInput = 'password';
        updateInputStyles();
    });
    
    passwordInput.addEventListener('blur', () => {
        focusedInput = null;
        updateInputStyles();
    });
    
    // 更新輸入框樣式
    function updateInputStyles() {
        // 電子郵件輸入框
        if (focusedInput === 'email') {
            emailInput.style.borderColor = '#3b82f6';
            emailInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
            emailInput.previousElementSibling.style.color = '#3b82f6';
        } else {
            emailInput.style.borderColor = '#cbd5e1';
            emailInput.style.boxShadow = 'none';
            emailInput.previousElementSibling.style.color = '#94a3b8';
        }
        
        // 密碼輸入框
        if (focusedInput === 'password') {
            passwordInput.style.borderColor = '#3b82f6';
            passwordInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
            passwordInput.previousElementSibling.style.color = '#3b82f6';
        } else {
            passwordInput.style.borderColor = '#cbd5e1';
            passwordInput.style.boxShadow = 'none';
            passwordInput.previousElementSibling.style.color = '#94a3b8';
        }
    }
    
    // 我們不再需要表單提交的 JS 攔截，因為表單會直接提交給 Django
    // 如果想要進行表單前端驗證，可以添加以下代碼：
    /* 
    loginForm.addEventListener('submit', (e) => {
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // 表單前端驗證 (可選)
        if (!email || !password) {
            e.preventDefault();
            alert('請填寫所有必要欄位');
            return false;
        }
        
        // 讓表單正常提交給 Django
        return true;
    });
    */
});