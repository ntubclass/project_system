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
    
    // 密碼切換相關元素
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordToggleIcon = document.getElementById('passwordToggleIcon');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const confirmPasswordToggleIcon = document.getElementById('confirmPasswordToggleIcon');
    
    // 密碼強度相關元素
    const strengthMeter = document.getElementById('strengthMeter');
    const passwordInfo = document.getElementById('passwordInfo');
    
    // 圓形元素
    const circles = document.querySelectorAll('.circle');
    
    // 追蹤滑鼠位置
    let mousePosition = { x: 0, y: 0 };
    
    // 追蹤輸入框焦點狀態
    let focusedInput = null;
    
    // 追蹤密碼顯示狀態
    let isPasswordVisible = false;
    let isConfirmPasswordVisible = false;
    
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
    
    // 密碼顯示/隱藏切換功能 - 主密碼
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
    
    // 密碼顯示/隱藏切換功能 - 確認密碼
    if (confirmPasswordToggle && confirmPasswordInput && confirmPasswordToggleIcon) {
        confirmPasswordToggle.addEventListener('click', function() {
            isConfirmPasswordVisible = !isConfirmPasswordVisible;
            
            if (isConfirmPasswordVisible) {
                // 顯示確認密碼
                confirmPasswordInput.type = 'text';
                confirmPasswordToggleIcon.className = 'fas fa-eye-slash';
                confirmPasswordToggle.classList.add('active');
                confirmPasswordToggle.title = '隱藏密碼';
            } else {
                // 隱藏確認密碼
                confirmPasswordInput.type = 'password';
                confirmPasswordToggleIcon.className = 'fas fa-eye';
                confirmPasswordToggle.classList.remove('active');
                confirmPasswordToggle.title = '顯示密碼';
            }
            
            // 保持焦點在輸入框上
            confirmPasswordInput.focus();
        });
        
        // 設置初始的 title 屬性
        confirmPasswordToggle.title = '顯示密碼';
        
        // 防止密碼切換按鈕觸發表單提交
        confirmPasswordToggle.addEventListener('mousedown', function(e) {
            e.preventDefault();
        });
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
    
    // 密碼強度檢測
    if (passwordInput && strengthMeter && passwordInfo) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            // 密碼強度檢查
            let strength = 0;
            let message = '';
            
            if (password.length >= 8) {
                strength += 1;
            } else {
                message = '密碼最少需要8個字符';
            }
            
            if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
                strength += 1;
            } else if (password.length >= 8) {
                message = '建議包含大小寫字母';
            }
            
            if (/[0-9]/.test(password) && /\W|_/.test(password)) {
                strength += 1;
            } else if (password.length >= 8) {
                message = '建議包含數字和特殊符號';
            }
            
            // 更新強度計
            strengthMeter.className = 'strength-meter';
            switch (strength) {
                case 1:
                    strengthMeter.classList.add('weak');
                    if (!message) message = '密碼強度：弱';
                    break;
                case 2:
                    strengthMeter.classList.add('medium');
                    if (!message) message = '密碼強度：中';
                    break;
                case 3:
                    strengthMeter.classList.add('strong');
                    if (!message) message = '密碼強度：強';
                    break;
                default:
                    message = '密碼最少需要8個字符';
            }
            
            passwordInfo.textContent = message;
        });
    }
    
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
                    
                    // 為密碼框設置切換按鈕樣式
                    const toggleElement = element.parentElement.querySelector('.password-toggle');
                    if (toggleElement && (name === 'password' || name === 'confirmPassword')) {
                        const isVisible = (name === 'password' && isPasswordVisible) || 
                                        (name === 'confirmPassword' && isConfirmPasswordVisible);
                        if (!isVisible) {
                            toggleElement.style.color = '#3b82f6';
                        }
                    }
                } else {
                    element.style.borderColor = '#cbd5e1';
                    element.style.boxShadow = 'none';
                    const iconElement = element.parentElement.querySelector('.input-icon');
                    if (iconElement) {
                        iconElement.style.color = '#94a3b8';
                    }
                    
                    // 恢復切換按鈕樣式
                    const toggleElement = element.parentElement.querySelector('.password-toggle');
                    if (toggleElement && (name === 'password' || name === 'confirmPassword')) {
                        const isVisible = (name === 'password' && isPasswordVisible) || 
                                        (name === 'confirmPassword' && isConfirmPasswordVisible);
                        if (!isVisible) {
                            toggleElement.style.color = '#94a3b8';
                        }
                    }
                }
            }
        });
    }
    
    // 鍵盤快捷鍵支援
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Shift + P 切換密碼顯示
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            if (document.activeElement === passwordInput && passwordToggle) {
                passwordToggle.click();
            } else if (document.activeElement === confirmPasswordInput && confirmPasswordToggle) {
                confirmPasswordToggle.click();
            }
        }
        
        // ESC 鍵隱藏密碼（如果當前顯示）
        if (e.key === 'Escape') {
            if (isPasswordVisible && passwordToggle) {
                passwordToggle.click();
            }
            if (isConfirmPasswordVisible && confirmPasswordToggle) {
                confirmPasswordToggle.click();
            }
        }
    });
    
    // 表單驗證
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            // 提交前確保密碼都是隱藏狀態
            if (isPasswordVisible && passwordToggle) {
                passwordToggle.click();
            }
            if (isConfirmPasswordVisible && confirmPasswordToggle) {
                confirmPasswordToggle.click();
            }
            
            // 驗證密碼長度
            if (passwordInput.value.length < 8) {
                e.preventDefault();
                // 創建錯誤訊息元素
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-error';
                errorDiv.textContent = '密碼長度必須至少為8個字符';
                
                // 在表單前插入錯誤訊息
                const formCard = document.querySelector('.form-card');
                const existingAlert = formCard.querySelector('.alert');
                
                if (existingAlert) {
                    formCard.replaceChild(errorDiv, existingAlert);
                } else {
                    formCard.insertBefore(errorDiv, registerForm);
                }
                
                // 將焦點設置在密碼欄位
                passwordInput.focus();
                return false;
            }
            
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
    
    // 頁面載入時初始化
    updateInputStyles();
});