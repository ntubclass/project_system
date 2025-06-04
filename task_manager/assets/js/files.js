let searchTimeout;

function performSearch(searchTerm) {
    const url = new URL(window.location);
    
    if (searchTerm && searchTerm.trim()) {
        url.searchParams.set('search', searchTerm.trim());
    } else {
        url.searchParams.delete('search');
    }
    
    window.location.href = url.toString();
}

function filterTable(searchTerm) {
    const fileTableBody = document.querySelector('.file-table-body');
    const fileRows = fileTableBody.querySelectorAll('.file-row');
    let visibleCount = 0;
    
    // 正規化搜尋詞，確保中文搜尋正常運作
    searchTerm = searchTerm.toLowerCase().trim();
    
    fileRows.forEach(row => {
        const fileName = row.querySelector('.file-name')?.textContent.toLowerCase().trim() || '';
        const fileType = row.querySelector('.file-type')?.textContent.toLowerCase().trim() || '';
        const ownerName = row.querySelector('.owner-cell')?.textContent.toLowerCase().trim() || '';
        
        // 使用 indexOf 而不是 includes 來確保中文相容性
        const isVisible = fileName.indexOf(searchTerm) !== -1 || 
                         fileType.indexOf(searchTerm) !== -1 || 
                         ownerName.indexOf(searchTerm) !== -1;
        
        if (isVisible) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 顯示無結果訊息
    let noResultsMessage = fileTableBody.querySelector('.no-results-message');
    if (visibleCount === 0 && searchTerm) {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.textContent = '沒有找到符合條件的檔案';
            fileTableBody.appendChild(noResultsMessage);
        }
        noResultsMessage.style.display = 'block';
    } else if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
    }
}

function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    // 載入頁面時設定搜尋值
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        searchInput.value = searchParam;
    }
    
    // 即時前端篩選
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        
        clearTimeout(searchTimeout);
        
        if (searchTerm.length === 0) {
            // 清空搜尋時顯示所有項目
            filterTable('');
        } else if (searchTerm.length >= 1) {
            // 對中文友善：從1個字元開始篩選
            filterTable(searchTerm);
        }
        
        // 延遲後端搜尋（可選）
        if (searchTerm.length >= 1) {
            searchTimeout = setTimeout(() => {
                performSearch(searchTerm);
            }, 1500); // 1.5秒延遲
        }
    });
    
    // Enter 鍵觸發後端搜尋
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(searchTimeout);
            performSearch(this.value);
        }
    });
}

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

    const selectedFiles = new Map();
    
    // 初始化搜尋功能
    initializeSearch();
    
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
        if (uploadDialog.hasAttribute("open")) {
            uploadDialog.close();
        }

        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            uploadDialog.showModal();
        });

        function closeDialogWithAnimation() {
            uploadDialog.setAttribute("closing", "");
            setTimeout(() => {
                uploadDialog.removeAttribute("closing");
                uploadDialog.close();
                resetUploadState();
            }, 200);
        }

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

        if (cancelUploadBtn) {
            cancelUploadBtn.addEventListener('click', closeDialogWithAnimation);
        }

        if (closeUploadBtn) {
            closeUploadBtn.addEventListener('click', closeDialogWithAnimation);
        }
        
        uploadDialog.addEventListener('close', function() {
            const existingConfirmDialog = document.getElementById('confirmOverwriteDialog');
            if (existingConfirmDialog) {
                document.body.removeChild(existingConfirmDialog);
            }
        });
    }
    
    // 拖放檔案功能
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

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

        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });
    }
    
    function handleFiles(files) {
        if (files.length) {
            for (let i = 0; i < files.length; i++) {
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
    
    function addFileToSelection(file) {
        const fileId = `${file.name}-${file.lastModified}`;
        selectedFiles.set(fileId, file);
    }
    
    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', function() {
            selectedFiles.clear();
            updateFilePreviewUI();
        });
    }
    
    function updateFilePreviewUI() {
        if (selectedFiles.size > 0) {
            filePreviewArea.style.display = 'block';
            fileCount.textContent = selectedFiles.size;
            
            fileList.innerHTML = '';
            
            selectedFiles.forEach((file, fileId) => {
                const fileItem = createFilePreviewItem(file, fileId);
                fileList.appendChild(fileItem);
            });
        } else {
            filePreviewArea.style.display = 'none';
            fileCount.textContent = '0';
        }
    }
    
    function createFilePreviewItem(file, fileId) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileType = fileTypeIcons[fileExt] || fileTypeIcons['default'];
        
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

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }

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

    function resetUploadState() {
        selectedFiles.clear();
        fileList.innerHTML = '';
        filePreviewArea.style.display = 'none';
        fileCount.textContent = '0';
        if (fileInput) fileInput.value = '';
        resetUploadProgressArea();
    }

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
            
            uploadFiles(false);
        });
    }

    function uploadFiles(overwrite = false) {
        const formData = new FormData();
        
        let totalSize = 0;
        selectedFiles.forEach(file => {
            formData.append('files', file);
            totalSize += file.size;
        });
        
        if (overwrite) {
            formData.append('overwrite', 'true');
        }
        
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        const uploadProgressArea = document.getElementById('uploadProgressArea');
        const progressBar = document.getElementById('uploadProgressBar');
        const progressPercent = document.getElementById('uploadProgressPercent');
        const progressStats = document.getElementById('uploadProgressStats');
        
        if (uploadProgressArea && filePreviewArea) {
            filePreviewArea.style.display = 'none';
            uploadProgressArea.style.display = 'block';
        }

        const formattedTotalSize = formatFileSize(totalSize);
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                const loaded = formatFileSize(e.loaded);
                
                if (progressBar) progressBar.style.width = percent + '%';
                if (progressPercent) progressPercent.textContent = percent + '%';
                if (progressStats) progressStats.textContent = `${loaded} / ${formattedTotalSize}`;
            }
        });
        
        xhr.timeout = 0;
        
        xhr.addEventListener('load', function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        uploadDialog.close();
                        resetUploadState();
                        Swal.fire({
                            icon: 'success',
                            title: "上傳成功",
                            text: "檔案已成功上傳！",
                            draggable: true,
                        }).then((result) => {
                            window.location.reload();
                        });
                    } else if (response.duplicate) {
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
                resetUploadProgressArea();
            }
        });
        
        xhr.addEventListener('error', function() {
            Swal.fire({
                icon: 'error',
                title: "上傳失敗",
                text: "網路連接錯誤，請稍後再試！",
                target: document.getElementById('uploadFileDialog'),
                draggable: true,
            });
            resetUploadProgressArea();
        });
        
        xhr.open('POST', `/upload_file/${window.PROJECT_ID}/`);
        xhr.setRequestHeader('X-CSRFToken', csrfToken);
        xhr.send(formData);
    }

    function showDuplicateConfirmDialog(duplicateFiles) {
        let fileListHtml = '<ul>';
        duplicateFiles.forEach(file => {
            fileListHtml += `<li><strong>${file.name}</strong><br>(原上傳者: ${file.existing_uploader}, 時間: ${file.existing_date})</li>`;
        });
        fileListHtml += '</ul>';
        
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
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = dialogHtml;
        document.body.appendChild(tempDiv.firstElementChild);
        
        const confirmDialog = document.getElementById('confirmOverwriteDialog');
        const cancelBtn = document.getElementById('cancelOverwriteBtn');
        const confirmBtn = document.getElementById('confirmOverwriteBtn');
        const closeConfirmBtn = document.getElementById('closeConfirmBtn');
        
        confirmDialog.showModal();
        
        const closeConfirmDialog = () => {
            confirmDialog.setAttribute("closing", "");
            confirmDialog.close();
        };
        
        confirmDialog.addEventListener('close', () => {
            setTimeout(() => {
                if (document.body.contains(confirmDialog)) {
                    document.body.removeChild(confirmDialog);
                }
            }, 200);
        });
        
        if (closeConfirmBtn) {
            closeConfirmBtn.addEventListener('click', closeConfirmDialog);
        }
        
        cancelBtn.addEventListener('click', closeConfirmDialog);
        
        confirmBtn.addEventListener('click', function() {
            confirmDialog.close();
            uploadFiles(true);
        });
    }
    
    // 下載按鈕功能
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const fileName = this.closest('.file-row').querySelector('.file-name').textContent;
            
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            fetch(`/download_file/${window.PROJECT_ID}/`, {
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
            
            fetch(`/delete_file/`, {
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
                        draggable: true,
                    }).then((result) => {
                        location.reload();
                    });
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
