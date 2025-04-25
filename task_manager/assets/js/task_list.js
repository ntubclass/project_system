document.addEventListener('DOMContentLoaded', function() {
    // 視圖按鈕切換
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        viewButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
  
    // 任務區段摺疊/展開
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const section = header.parentElement;
        const taskCards = section.querySelector('.task-cards');
        const icon = header.querySelector('.section-icon');
        
        if (taskCards.style.display === 'none') {
          taskCards.style.display = 'grid';
          icon.classList.remove('fa-caret-right');
          icon.classList.add('fa-caret-down');
        } else {
          taskCards.style.display = 'none';
          icon.classList.remove('fa-caret-down');
          icon.classList.add('fa-caret-right');
        }
      });
    });
  
    // 設置任務進度條 - 類似 project.js 的方式
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
      // 取得已設定的 width 百分比 (如果直接在 style 中設定)
      const style = window.getComputedStyle(bar);
      const width = style.width;
      const parentWidth = window.getComputedStyle(bar.parentElement).width;
      
      // 計算進度百分比
      let progressValue = parseInt(width) / parseInt(parentWidth) * 100;
      
      // 如果沒有通過 style 直接設定，檢查是否有 progress 屬性
      if (isNaN(progressValue) && bar.hasAttribute('progress')) {
        progressValue = bar.getAttribute('progress');
      }
      
      // 若進度值存在，更新相應的進度文字
      if (progressValue) {
        const progressBarContainer = bar.closest('.progress-bar');
        const progressContainer = progressBarContainer.previousElementSibling;
        
        if (progressContainer && progressContainer.classList.contains('progress-container')) {
          const percentageDisplay = progressContainer.querySelector('.progress-percentage');
          if (percentageDisplay) {
            percentageDisplay.textContent = `${progressValue}%`;
          }
        }
      }
    });
  });