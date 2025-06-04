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
    
    searchTerm = searchTerm.toLowerCase().trim();
    
    fileRows.forEach(row => {
        const fileName = row.querySelector('.file-name')?.textContent.toLowerCase().trim() || '';
        const fileType = row.querySelector('.file-type')?.textContent.toLowerCase().trim() || '';
        const ownerName = row.querySelector('.owner-cell')?.textContent.toLowerCase().trim() || '';
        
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
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        searchInput.value = searchParam;
    }
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        
        clearTimeout(searchTimeout);
        
        if (searchTerm.length === 0) {
            filterTable('');
        } else if (searchTerm.length >= 1) {
            filterTable(searchTerm);
        }
        
        if (searchTerm.length >= 1) {
            searchTimeout = setTimeout(() => {
                performSearch(searchTerm);
            }, 1500);
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(searchTimeout);
            performSearch(this.value);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
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
    
    initializeSearch();
    
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
                    draggable: true,
                });
            });
        }
    });
}
