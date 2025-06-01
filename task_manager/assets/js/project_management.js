let searchTimeout;

function goToPage(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    
    // 保持搜尋關鍵字
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value.trim()) {
        url.searchParams.set('search', searchInput.value.trim());
    }
    
    window.location.href = url.toString();
}

function previousPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

function nextPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    
    // 從 DOM 取得總頁數
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    const totalPages = paginationNumbers.length > 0 ? 
        Math.max(...Array.from(paginationNumbers).map(btn => parseInt(btn.textContent))) : 1;
    
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

function performSearch(searchTerm) {
    const url = new URL(window.location);
    
    if (searchTerm && searchTerm.trim()) {
        url.searchParams.set('search', searchTerm.trim());
    } else {
        url.searchParams.delete('search');
    }
    
    // 搜尋時回到第一頁
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function filterTable(searchTerm) {
    const tableBody = document.getElementById('projectTableBody');
    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const projectName = row.querySelector('.project-name')?.textContent.toLowerCase() || '';
        const projectDesc = row.querySelector('.project-description')?.textContent.toLowerCase() || '';
        const assigneeName = row.querySelector('.assignee-name')?.textContent.toLowerCase() || '';
        const timelineInfo = row.querySelector('.timeline-info')?.textContent.toLowerCase() || '';
        
        const isVisible = projectName.includes(searchTerm) || 
                         projectDesc.includes(searchTerm) || 
                         assigneeName.includes(searchTerm) || 
                         timelineInfo.includes(searchTerm);
        
        if (isVisible) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // 更新顯示數量
    const showingCount = document.getElementById('showingCount');
    if (showingCount) {
        showingCount.textContent = visibleCount;
    }
    
    // 隱藏分頁控制當使用前端搜尋時
    const paginationControls = document.querySelector('.pagination-controls');
    if (paginationControls) {
        paginationControls.style.display = searchTerm ? 'none' : '';
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
    
    // 即時搜尋
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        
        clearTimeout(searchTimeout);
        
        if (searchTerm.length === 0) {
            // 清空搜尋時顯示所有項目
            filterTable('');
        } else if (searchTerm.length >= 2) {
            // 前端即時篩選
            filterTable(searchTerm);
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
    
    // 延遲後端搜尋（可選）
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        
        clearTimeout(searchTimeout);
        
        if (searchTerm.length >= 3) {
            searchTimeout = setTimeout(() => {
                performSearch(searchTerm);
            }, 1000);
        }
    });
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});