document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('search-results');
    const searchResultsContent = document.getElementById('search-results-content');
    const searchLoading = document.getElementById('search-loading');
    const searchNoResults = document.getElementById('search-no-results');
    const clearBtn = document.getElementById('search-clear-btn');
    
    let searchTimeout;
    let isSearching = false;
    
    // 搜尋輸入處理
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length === 0) {
            hideSearchResults();
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'block';
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // 清除按鈕
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        hideSearchResults();
        clearBtn.style.display = 'none';
        searchInput.focus();
    });
    
    // 點擊外部隱藏結果
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#global-search-container')) {
            hideSearchResults();
        }
    });
    
    // 鍵盤導航
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideSearchResults();
        }
    });
    
    // 快捷鍵支援 Ctrl+K
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            searchInput.focus();
        }
    });
    
    function performSearch(query) {
        if (isSearching) return;
        
        isSearching = true;
        showLoading();
        
        fetch(`/global_search/?q=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('搜尋請求失敗');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                displayResults(data.results);
            })
            .catch(error => {
                console.error('搜尋錯誤:', error);
                showNoResults();
            })
            .finally(() => {
                isSearching = false;
                hideLoading();
            });
    }
    
    function displayResults(results) {
        searchResultsContent.innerHTML = '';
        
        if (results.length === 0) {
            showNoResults();
            return;
        }
        
        results.forEach(result => {
            const resultElement = createResultElement(result);
            searchResultsContent.appendChild(resultElement);
        });
        
        showSearchResults();
        searchNoResults.style.display = 'none';
    }
    
    function createResultElement(result) {
        const div = document.createElement('div');
        div.className = `search-result-item type-${result.type}`;
        div.addEventListener('click', () => {
            window.location.href = result.url;
        });
        
        div.innerHTML = `
            <div class="search-result-icon">
                <i class="${result.icon}"></i>
            </div>
            <div class="search-result-content">
                <div class="search-result-title">${escapeHtml(result.title)}</div>
                <div class="search-result-description">${escapeHtml(result.description)}</div>
                <div class="search-result-meta">${escapeHtml(result.meta)}</div>
            </div>
        `;
        
        return div;
    }
    
    function showSearchResults() {
        searchResults.style.display = 'block';
    }
    
    function hideSearchResults() {
        searchResults.style.display = 'none';
    }
    
    function showLoading() {
        searchLoading.style.display = 'flex';
        searchResultsContent.innerHTML = '';
        searchNoResults.style.display = 'none';
        showSearchResults();
    }
    
    function hideLoading() {
        searchLoading.style.display = 'none';
    }
    
    function showNoResults() {
        searchResultsContent.innerHTML = '';
        searchNoResults.style.display = 'block';
        showSearchResults();
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});