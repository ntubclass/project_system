document.addEventListener('DOMContentLoaded', function() {    
    // 上傳檔案按鈕功能
    const uploadBtn = document.getElementById('openUploadFileBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // 這裡可以實現上傳檔案的功能
            // 例如顯示一個上傳對話框或跳轉到上傳頁面
            alert('開啟上傳檔案功能');
        });
    }
    
    // 下載按鈕功能
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const fileName = this.closest('.file-row').querySelector('.file-name').textContent;
            // 這裡可以實現下載檔案的功能
            alert(`下載檔案: ${fileName}`);
        });
    });
});