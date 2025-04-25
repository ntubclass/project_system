document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const registerContainer = document.getElementById('registerContainer');
    const fullNameInput = document.getElementById('fullName');
    const positionInput = document.getElementById('position');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerForm = document.getElementById('registerForm');
    
    // 圓形元素
    const circles = document.querySelectorAll('.circle');
    
    // 追蹤滑鼠位置
    let mousePosition = { x: 0, y: 0 };
    
    // 追蹤輸入框焦點狀態
    let focusedInput = null;
    
    // 監聽滑鼠移動
    document.addEventListener('mousemove', (e) => {
        if (registerContainer) {
            const rect = registerContainer.getBoundingClientRect();
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
    function setupInputFocus(inputElement, inputName) {
        if (inputElement) {
            inputElement.addEventListener('focus', () => {
                focusedInput = inputName;
                updateInputStyles();
            });
            
            inputElement.addEventListener('blur', () => {
                focusedInput = null;
                updateInputStyles();
            });
        }
    }
    
    // 設置所有輸入欄位的焦點事件處理
    setupInputFocus(fullNameInput, 'fullName');
    setupInputFocus(positionInput, 'position');
    setupInputFocus(emailInput, 'email');
    setupInputFocus(phoneInput, 'phone');
    setupInputFocus(passwordInput, 'password');
    setupInputFocus(confirmPasswordInput, 'confirmPassword');
    
    // 更新輸入框樣式
    function updateInputStyles() {
        const inputs = [
            {element: fullNameInput, name: 'fullName'},
            {element: positionInput, name: 'position'},
            {element: emailInput, name: 'email'},
            {element: phoneInput, name: 'phone'},
            {element: passwordInput, name: 'password'},
            {element: confirmPasswordInput, name: 'confirmPassword'}
        ];
        
        inputs.forEach(({element, name}) => {
            if (element) {
                if (focusedInput === name) {
                    element.style.borderColor = '#3b82f6';
                    element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                    const iconElement = element.parentElement.querySelector('.input-icon');
                    if (iconElement) {
                        iconElement.style.color = '#3b82f6';
                    }
                } else {
                    element.style.borderColor = '#cbd5e1';
                    element.style.boxShadow = 'none';
                    const iconElement = element.parentElement.querySelector('.input-icon');
                    if (iconElement) {
                        iconElement.style.color = '#94a3b8';
                    }
                }
            }
        });
    }
    
    // 表單驗證
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            // 驗證密碼是否一致
            if (passwordInput.value !== confirmPasswordInput.value) {
                e.preventDefault();
                // 創建錯誤訊息元素
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-error';
                errorDiv.textContent = '密碼不一致，請重新確認';
                
                // 在表單前插入錯誤訊息
                const formCard = document.querySelector('.form-card');
                const existingAlert = formCard.querySelector('.alert');
                
                if (existingAlert) {
                    formCard.replaceChild(errorDiv, existingAlert);
                } else {
                    formCard.insertBefore(errorDiv, registerForm);
                }
                
                // 將焦點設置在確認密碼欄位
                confirmPasswordInput.focus();
                return false;
            }
            
            // 如果所有驗證都通過，表單正常提交
            return true;
        });
    }
});