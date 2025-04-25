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
});