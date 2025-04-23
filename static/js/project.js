const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const header = document.querySelector('.header');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-hidden');
    mainContent.classList.toggle('main-content-full');
    header.classList.toggle('header-full'); 
});

// 設置進度條長度和更新顯示的百分比
document.addEventListener('DOMContentLoaded', () => {
    // 獲取所有進度條元素
    const progressBars = document.querySelectorAll('.progress-fill');
    
    // 遍歷每個進度條元素
    progressBars.forEach(bar => {
        // 獲取progress屬性值
        const progressValue = bar.getAttribute('progress');
        
        // 如果存在progress屬性，則設置寬度
        if (progressValue) {
            // 設置進度條寬度為progress值的百分比
            bar.style.width = `${progressValue}%`;
            
            // 找到對應的百分比顯示元素並更新
            // 先找到父元素 (.progress-bar)，再往上找到包含 .progress-label 的祖先元素
            const progressBarContainer = bar.closest('.progress-bar');
            const progressLabelContainer = progressBarContainer.previousElementSibling;
            
            // 如果找到了進度標籤容器，更新其中的百分比顯示
            if (progressLabelContainer && progressLabelContainer.classList.contains('progress-label')) {
                const percentageDisplay = progressLabelContainer.querySelector('div:last-child');
                if (percentageDisplay) {
                    percentageDisplay.textContent = `${progressValue}%`;
                }
            }
        }
    });
    
    // 確保這個也在DOM加載完成後執行
    // 獲取按鈕和對話框元素
    const openCreateProjectBtn = document.getElementById('openCreateProjectBtn');
    const createProjectDialog = document.getElementById('createProjectDialog');
    
    // 檢查元素是否存在
    if (openCreateProjectBtn && createProjectDialog) {
        console.log("按鈕和對話框元素已找到");
        // 添加點擊事件監聽器
        openCreateProjectBtn.addEventListener('click', function() {
            console.log("按鈕被點擊");
            createProjectDialog.classList.add('active');
        });
    } else {
        console.log("找不到按鈕或對話框元素", {
            按鈕: openCreateProjectBtn,
            對話框: createProjectDialog
        });
    }
});