document.addEventListener('DOMContentLoaded', function() {
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const strengthMeter = document.getElementById('strengthMeter');
    const passwordInfo = document.getElementById('passwordInfo');
    const resetForm = document.getElementById('resetPasswordForm');
    
    // 密碼強度檢測
    newPasswordInput.addEventListener('input', function() {
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
    
    // 表單提交驗證
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (newPassword.length < 8) {
                e.preventDefault();
                alert('密碼長度必須至少為8個字符');
                newPasswordInput.focus();
                return false;
            }
            
            if (newPassword !== confirmPassword) {
                e.preventDefault();
                alert('兩次輸入的密碼不一致');
                confirmPasswordInput.focus();
                return false;
            }
        });
    }
});