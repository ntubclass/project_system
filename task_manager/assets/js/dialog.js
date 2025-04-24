document.addEventListener("DOMContentLoaded", function () {
    function setup_dialog(openBtnId, dialogId, closeBtnId) {
        const openBtn = document.getElementById(openBtnId);
        const dialog = document.getElementById(dialogId);
        const closeBtn = document.getElementById(closeBtnId);
        const closeXBtn = document.getElementById('closeDialogBtn');

        if (!openBtn || !dialog || !closeBtn) {
            return;
        }

        // 確保對話框一開始是關閉的
        if (dialog.hasAttribute('open')) {
            dialog.close();
        }

        openBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            dialog.showModal();
        });

        // 自定義關閉對話框的函數，添加動畫
        function closeDialogWithAnimation() {
            dialog.setAttribute('closing', '');
            setTimeout(() => {
                dialog.removeAttribute('closing');
                dialog.close();
            }, 200); // 與CSS動畫時間相同
        }
        
        // 點擊對話框背景關閉
        dialog.addEventListener('click', (e) => {
            const rect = dialog.getBoundingClientRect();
            const isInDialog = (
                rect.top <= e.clientY &&
                e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX &&
                e.clientX <= rect.left + rect.width
            );
            if (!isInDialog) {
                closeDialogWithAnimation();
            }
        });

        // 取消按鈕關閉對話框
        closeBtn.addEventListener('click', () => {
            closeDialogWithAnimation();
        });
        
        // X按鈕關閉對話框
        if (closeXBtn) {
            closeXBtn.addEventListener('click', () => {
                closeDialogWithAnimation();
            });
        }

        // 監聽ESC鍵關閉事件
        dialog.addEventListener('cancel', (e) => {
            e.preventDefault();
            closeDialogWithAnimation();
        });
    }

    setup_dialog('openCreateProjectBtn', 'createProjectDialog', 'cancelProjectBtn');
})