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
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
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
        
        // 對話框關閉事件
        uploadDialog.addEventListener('close', function() {
            // 清理任何可能殘留的確認對話框
            const existingConfirmDialog = document.getElementById('confirmOverwriteDialog');
            if (existingConfirmDialog) {
                document.body.removeChild(existingConfirmDialog);
            }
        });
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
                //檢查檔案大小限制
                if (files[i].size > 200 * 1024 * 1024) {
                    Swal.fire({
                        icon: 'error',
                        title: "超過大小限制",
                        text: `檔案 ${files[i].name} 超過大小限制！`,
                        target: document.getElementById('uploadFileDialog'),
                        draggable: true,
                    });
                    continue;
                }
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

    // 重置上傳進度區域
    function resetUploadProgressArea() {
        const uploadProgressArea = document.getElementById('uploadProgressArea');
        const progressBar = document.getElementById('uploadProgressBar');
        const progressPercent = document.getElementById('uploadProgressPercent');
        const progressStats = document.getElementById('uploadProgressStats');
        
        if (uploadProgressArea && filePreviewArea) {
            uploadProgressArea.style.display = 'none';
            filePreviewArea.style.display = 'block';
        }
        
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        if (progressStats) progressStats.textContent = '0 / 0 MB';
    }

    // 重置上傳狀態
    function resetUploadState() {
        selectedFiles.clear();
        fileList.innerHTML = '';
        filePreviewArea.style.display = 'none';
        fileCount.textContent = '0';
        if (fileInput) fileInput.value = '';
        resetUploadProgressArea();  // 同時重置進度區域
    }

    // 處理表單提交
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (selectedFiles.size === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: "請選擇檔案",
                    text: `請選擇至少一個檔案進行上傳！`,
                    target: document.getElementById('uploadFileDialog'),
                    draggable: true,
                });
                return;
            }
            
            uploadFiles(false);  // 第一次嘗試上傳，不覆蓋
        });
    }

    // 上傳檔案函數
    function uploadFiles(overwrite = false) {
        // 建立 FormData
        const formData = new FormData();
        
        // 添加所有選擇的檔案
        let totalSize = 0;
        selectedFiles.forEach(file => {
            formData.append('files', file);
            totalSize += file.size;
        });
        
        // 如果是覆蓋模式，添加覆蓋參數
        if (overwrite) {
            formData.append('overwrite', 'true');
        }
        
        // 獲取 CSRF Token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // 顯示進度區域，隱藏檔案預覽區域
        const uploadProgressArea = document.getElementById('uploadProgressArea');
        const progressBar = document.getElementById('uploadProgressBar');
        const progressPercent = document.getElementById('uploadProgressPercent');
        const progressStats = document.getElementById('uploadProgressStats');
        
        if (uploadProgressArea && filePreviewArea) {
            filePreviewArea.style.display = 'none';
            uploadProgressArea.style.display = 'block';
        }

        // 格式化總大小
        const formattedTotalSize = formatFileSize(totalSize);
        
        // 創建 XHR 請求，以便追蹤上傳進度
        const xhr = new XMLHttpRequest();
        
        // 監聽上傳進度
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                const loaded = formatFileSize(e.loaded);
                
                if (progressBar) progressBar.style.width = percent + '%';
                if (progressPercent) progressPercent.textContent = percent + '%';
                if (progressStats) progressStats.textContent = `${loaded} / ${formattedTotalSize}`;
            }
        });
        
        // 設置超時
        xhr.timeout = 0;  // 無限等待
        
        // 設置完成事件
        xhr.addEventListener('load', function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        // 關閉對話框
                        uploadDialog.close();
                        // 重置上傳狀態
                        resetUploadState();
                        // 重新載入頁面以顯示新上傳的檔案
                        Swal.fire({
                            icon: 'success',
                            title: "上傳成功",
                            text: "檔案已成功上傳！",
                            draggable: true,
                        }).then((result) => {
                            window.location.reload();
                        });;
                    } else if (response.duplicate) {
                        // 處理重複檔案的情況
                        // 先重置進度區域
                        resetUploadProgressArea();
                        showDuplicateConfirmDialog(response.duplicate_files);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: "上傳失敗",
                            text: response.error || "伺服器錯誤，請稍後再試！",
                            target: document.getElementById('uploadFileDialog'),
                            draggable: true,
                        });
                        resetUploadProgressArea();
                    }
                } catch (e) {
                    console.error('解析回應錯誤：', e);
                    Swal.fire({
                        icon: 'error',
                        title: "上傳失敗",
                        text: "伺服器回應格式錯誤！",
                        target: document.getElementById('uploadFileDialog'),
                        draggable: true,
                    });
                    resetUploadProgressArea();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: "上傳失敗",
                    text: "伺服器錯誤，請稍後再試！",
                    target: document.getElementById('uploadFileDialog'),
                    draggable: true,
                });
                // 重置上傳進度界面
                resetUploadProgressArea();
            }
        });
        
        // 設置錯誤事件
        xhr.addEventListener('error', function() {
            Swal.fire({
                icon: 'error',
                title: "上傳失敗",
                text: "網路連接錯誤，請稍後再試！",
                target: document.getElementById('uploadFileDialog'),
                draggable: true,
            });
            // 重置上傳進度界面
            resetUploadProgressArea();
        });
        
        // 打開連接並發送請求
        xhr.open('POST', '/upload_file/');
        xhr.setRequestHeader('X-CSRFToken', csrfToken);
        xhr.send(formData);
    }

    // 顯示重複檔案確認對話框的函數
    function showDuplicateConfirmDialog(duplicateFiles) {
        let fileListHtml = '<ul>';
        duplicateFiles.forEach(file => {
            fileListHtml += `<li><strong>${file.name}</strong><br>(原上傳者: ${file.existing_uploader}, 時間: ${file.existing_date})</li>`;
        });
        fileListHtml += '</ul>';
        
        // 創建確認對話框
        const dialogHtml = `
            <dialog id="confirmOverwriteDialog" class="custom-dialog">
                <div class="dialog-header">
                    <h2 class="dialog-title">發現重複檔案</h2>
                    <button id="closeConfirmBtn" class="close-btn">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="dialog-content">
                    <div class="duplicate-files-warning">
                        <div>
                            <i class="fa-solid fa-exclamation-triangle"></i>
                            <div>
                                <p>以下檔案已存在：</p>
                                ${fileListHtml}
                                <p>是否要覆蓋這些檔案？</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button id="cancelOverwriteBtn" class="cancel-btn">取消</button>
                    <button id="confirmOverwriteBtn" class="confirm-btn" style="background-color: #e74c3c;">覆蓋檔案</button>
                </div>
            </dialog>
        `;
        
        // 添加對話框到頁面
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = dialogHtml;
        document.body.appendChild(tempDiv.firstElementChild);
        
        const confirmDialog = document.getElementById('confirmOverwriteDialog');
        const cancelBtn = document.getElementById('cancelOverwriteBtn');
        const confirmBtn = document.getElementById('confirmOverwriteBtn');
        const closeConfirmBtn = document.getElementById('closeConfirmBtn');
        
        // 顯示對話框
        confirmDialog.showModal();
        
        // 統一的關閉處理函數
        const closeConfirmDialog = () => {
            confirmDialog.setAttribute("closing", "");
            confirmDialog.close();
        };
        
        // 對話框關閉事件
        confirmDialog.addEventListener('close', () => {
            setTimeout(() => {
                if (document.body.contains(confirmDialog)) {
                    document.body.removeChild(confirmDialog);
                }
            }, 200);
        });
        
        // 關閉按鈕
        if (closeConfirmBtn) {
            closeConfirmBtn.addEventListener('click', closeConfirmDialog);
        }
        
        // 取消按鈕
        cancelBtn.addEventListener('click', closeConfirmDialog);
        
        // 確認覆蓋按鈕
        confirmBtn.addEventListener('click', function() {
            confirmDialog.close();
            uploadFiles(true);  // 重新上傳，設置覆蓋為 true
        });
    }
    
    // 下載按鈕功能
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const fileName = this.closest('.file-row').querySelector('.file-name').textContent;
            
            // 取得 CSRF Token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            // 使用 POST 請求下載
            fetch('/download_file/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `file_name=${encodeURIComponent(fileName)}`
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
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
                if (error.error) {
                    Swal.fire({
                        icon: 'error',
                        title: "下載失敗",
                        text: error.error,
                        draggable: true,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: "下載失敗",
                        text: "伺服器錯誤，請稍後再試！",
                        draggable: true,
                    });
                }
            });
        });
    });
});

function deleteFile(fileId, fileName) {
    Swal.fire({
        title: "確認刪除檔案",
        text: `您確定要刪除檔案 "${fileName}" 嗎？`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "刪除",
        cancelButtonText: "取消",
    }).then((result) => {
        if (result.isConfirmed) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            fetch('/delete_file/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: new URLSearchParams({
                    'file_id': fileId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: "刪除成功",
                        text: "檔案已成功刪除！",
                        target: document.getElementById('uploadFileDialog'),
                        draggable: true,
                    });
                    location.reload(); // 重新載入頁面
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: "刪除失敗",
                        text: data.error || "伺服器錯誤，請稍後再試！",
                        target: document.getElementById('uploadFileDialog'),
                        draggable: true,
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: "刪除失敗",
                    text: "伺服器錯誤，請稍後再試！",
                    target: document.getElementById('uploadFileDialog'),
                    draggable: true,
                });
            });
        }
    });
}