document.addEventListener('DOMContentLoaded', function() {
    // 檔案類型圖標映射
    const fileTypeIcons = {
        'pdf': { icon: 'fa-file-pdf', bgClass: 'pdf-icon' },
        'doc': { icon: 'fa-file-word', bgClass: 'word-icon' },
        'docx': { icon: 'fa-file-word', bgClass: 'word-icon' },
        'xls': { icon: 'fa-file-excel', bgClass: 'excel-icon' },
        'xlsx': { icon: 'fa-file-excel', bgClass: 'excel-icon' },
        'ppt': { icon: 'fa-file-powerpoint', bgClass: 'ppt-icon' },
        'pptx': { icon: 'fa-file-powerpoint', bgClass: 'ppt-icon' },
        'jpg': { icon: 'fa-file-image', bgClass: 'image-icon' },
        'jpeg': { icon: 'fa-file-image', bgClass: 'image-icon' },
        'png': { icon: 'fa-file-image', bgClass: 'image-icon' },
        'gif': { icon: 'fa-file-image', bgClass: 'image-icon' },
        'txt': { icon: 'fa-file-alt', bgClass: 'text-icon' },
        'zip': { icon: 'fa-file-archive', bgClass: 'archive-icon' },
        'rar': { icon: 'fa-file-archive', bgClass: 'archive-icon' },
        'mp3': { icon: 'fa-file-audio', bgClass: 'audio-icon' },
        'mp4': { icon: 'fa-file-video', bgClass: 'video-icon' },
        'default': { icon: 'fa-file', bgClass: 'default-icon' }
    };

    const selectedFiles = new Map();  // 使用 Map 存儲已選擇的檔案
    
    // 取得元素
    const uploadBtn = document.getElementById('openUploadFileBtn');
    const uploadDialog = document.getElementById('uploadFileDialog');
    const closeUploadBtn = document.getElementById('closeUploadBtn');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const filePreviewArea = document.getElementById('filePreviewArea');
    const fileList = document.getElementById('fileList');
    const fileCount = document.getElementById('fileCount');
    const clearFilesBtn = document.getElementById('clearFilesBtn');
    const uploadForm = document.getElementById('uploadFileForm');
    
    // 設置對話框
    if (uploadBtn && uploadDialog) {
        // 確保對話框一開始是關閉的
        if (uploadDialog.hasAttribute("open")) {
            uploadDialog.close();
        }

        // 打開對話框
        uploadBtn.addEventListener('click', function() {
            uploadDialog.showModal();
        });

        // 自定義關閉對話框的函數，添加動畫
        function closeDialogWithAnimation() {
            uploadDialog.setAttribute("closing", "");
            setTimeout(() => {
                uploadDialog.removeAttribute("closing");
                uploadDialog.close();
                resetUploadState();  // 重置上傳狀態
            }, 200);
        }

        // 點擊對話框背景關閉
        uploadDialog.addEventListener("click", (e) => {
            const rect = uploadDialog.getBoundingClientRect();
            const isInDialog =
                rect.top <= e.clientY &&
                e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX &&
                e.clientX <= rect.left + rect.width;
            if (!isInDialog) {
                closeDialogWithAnimation();
            }
        });

        // 取消按鈕關閉對話框
        if (cancelUploadBtn) {
            cancelUploadBtn.addEventListener('click', closeDialogWithAnimation);
        }

        // 關閉按鈕關閉對話框
        if (closeUploadBtn) {
            closeUploadBtn.addEventListener('click', closeDialogWithAnimation);
        }
    }
    
    // 拖放檔案功能
    if (dropZone) {
        // 阻止瀏覽器默認行為
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // 高亮拖放區域
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropZone.classList.add('drag-over');
        }

        function unhighlight() {
            dropZone.classList.remove('drag-over');
        }

        // 處理拖放的檔案
        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }
    }
    
    // 處理檔案選擇
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });
    }
    
    // 處理選擇的檔案
    function handleFiles(files) {
        if (files.length) {
            for (let i = 0; i < files.length; i++) {
                addFileToSelection(files[i]);
            }
            updateFilePreviewUI();
        }
    }
    
    // 添加檔案到選擇列表
    function addFileToSelection(file) {
        // 使用檔案的 name 和 lastModified 作為唯一標示符
        const fileId = `${file.name}-${file.lastModified}`;
        selectedFiles.set(fileId, file);
    }
    
    // 清除所有選擇的檔案
    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', function() {
            selectedFiles.clear();
            updateFilePreviewUI();
        });
    }
    
    // 更新檔案預覽區域UI
    function updateFilePreviewUI() {
        if (selectedFiles.size > 0) {
            filePreviewArea.style.display = 'block';
            fileCount.textContent = selectedFiles.size;
            
            // 清空現有預覽
            fileList.innerHTML = '';
            
            // 添加每個檔案的預覽
            selectedFiles.forEach((file, fileId) => {
                const fileItem = createFilePreviewItem(file, fileId);
                fileList.appendChild(fileItem);
            });
        } else {
            filePreviewArea.style.display = 'none';
            fileCount.textContent = '0';
        }
    }
    
    // 創建檔案預覽項目
    function createFilePreviewItem(file, fileId) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // 取得檔案類型
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileType = fileTypeIcons[fileExt] || fileTypeIcons['default'];
        
        // 格式化檔案大小
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-preview-icon ${fileType.bgClass}">
                    <i class="fa-solid ${fileType.icon}"></i>
                </div>
                <div class="file-preview-details">
                    <div class="file-preview-name" title="${file.name}">${file.name}</div>
                    <div class="file-preview-size">${fileSize}</div>
                </div>
            </div>
            <button type="button" class="file-remove-btn" data-file-id="${fileId}">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        
        // 添加移除按鈕事件
        const removeBtn = fileItem.querySelector('.file-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                const fileId = this.getAttribute('data-file-id');
                selectedFiles.delete(fileId);
                updateFilePreviewUI();
            });
        }
        
        return fileItem;
    }

    // 格式化文件大小函數
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 重置上傳狀態
    function resetUploadState() {
        selectedFiles.clear();
        fileList.innerHTML = '';
        filePreviewArea.style.display = 'none';
        fileCount.textContent = '0';
        if (fileInput) fileInput.value = '';
    }

    // 處理表單提交
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (selectedFiles.size === 0) {
                alert('請選擇至少一個檔案進行上傳！');
                return;
            }
            
            // 建立 FormData
            const formData = new FormData();
            
            // 添加所有選擇的檔案
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            
            // 獲取 CSRF Token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            // 發送上傳請求
            fetch('/files/upload/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('上傳失敗，請稍後再試！');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('檔案上傳成功！');
                    // 關閉對話框
                    uploadDialog.close();
                    // 重置上傳狀態
                    resetUploadState();
                    // 重新載入頁面以顯示新上傳的檔案
                    window.location.reload();
                } else {
                    alert(data.message || '上傳失敗，請稍後再試！');
                }
            })
            .catch(error => {
                console.error('上傳錯誤：', error);
                alert('上傳失敗，請稍後再試！');
            });
        });
    }
    
    // 下載按鈕功能
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const fileName = this.closest('.file-row').querySelector('.file-name').textContent;
            // 這裡可以實現下載檔案的功能
            // 實際使用時，應該發送請求到後端獲取檔案
            fetch(`/files/download/?file_name=${encodeURIComponent(fileName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('下載失敗，請稍後再試！');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch(error => {
                console.error('下載錯誤：', error);
                alert('下載失敗，請稍後再試！');
            });
        });
    });
});