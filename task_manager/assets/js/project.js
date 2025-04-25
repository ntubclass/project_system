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
});