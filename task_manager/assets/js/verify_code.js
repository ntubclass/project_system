document.addEventListener('DOMContentLoaded', function() {
    const codeInputs = document.querySelectorAll('.code-input');
    const hiddenInput = document.getElementById('hiddenCodeInput');
    
    // 自動聚焦到第一個輸入框
    codeInputs[0].focus();
    
    // 處理輸入事件
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            const value = e.target.value;
            
            // 只允許數字
            if (!/^\d*$/.test(value)) {
                e.target.value = '';
                return;
            }
            
            // 如果有值，移動到下一個輸入框
            if (value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            
            // 更新隱藏輸入框的值
            updateHiddenInput();
        });
        
        // 處理刪除鍵
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        
        // 處理貼上操作
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').trim().substr(0, 6);
            
            if (/^\d+$/.test(pasteData)) {
                // 填充每個輸入框
                for (let i = 0; i < pasteData.length && i < codeInputs.length; i++) {
                    codeInputs[i].value = pasteData[i];
                    
                    // 移動聚焦到最後一個填充的輸入框之後
                    if (i === pasteData.length - 1 && i < codeInputs.length - 1) {
                        codeInputs[i + 1].focus();
                    }
                }
                
                // 更新隱藏輸入框的值
                updateHiddenInput();
            }
        });
    });
    
    // 更新隱藏輸入框的值
    function updateHiddenInput() {
        let code = '';
        codeInputs.forEach(input => {
            code += input.value;
        });
        hiddenInput.value = code;
    }

    // 處理重新發送驗證碼表單
    const resendForm = document.querySelector('form[action*="resend_code"]');
    if (resendForm) {
        // 禁止重新發送按鈕連續點擊
        resendForm.addEventListener('submit', function() {
            const resendBtn = this.querySelector('button');
            if (resendBtn) {
                resendBtn.disabled = true;
                resendBtn.textContent = '發送中...';
            }
        });
    }
});