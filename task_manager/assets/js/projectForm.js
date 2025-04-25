document.addEventListener("DOMContentLoaded", function () {
  // 添加表單 AJAX 提交處理
  const submitProjectBtn = document.getElementById('submitProjectBtn');
  const createProjectForm = document.getElementById('createProjectForm');
  const formErrors = document.getElementById('formErrors');
  
  if (submitProjectBtn && createProjectForm) {
      submitProjectBtn.addEventListener('click', function(e) {
          e.preventDefault();
          
          // 創建 FormData 物件
          const formData = new FormData(createProjectForm);
          
          // 發送 AJAX 請求
          fetch(createProjectForm.action, {
              method: 'POST',
              body: formData,
              headers: {
                  'X-Requested-With': 'XMLHttpRequest',
              },
          })
          .then(response => response.json())
          .then(data => {
              if (data.status === 'error') {
                  // 顯示錯誤訊息
                  formErrors.innerHTML = '';
                  data.errors.forEach(error => {
                      // 創建內嵌式 alert
                      const alertDiv = document.createElement('div');
                      alertDiv.className = 'alert alert-warning';
                      alertDiv.textContent = error;
                      formErrors.appendChild(alertDiv);
                      
                      // 自動消失
                      setTimeout(() => {
                          alertDiv.style.transition = "opacity 0.5s";
                          alertDiv.style.opacity = "0";
                          setTimeout(() => alertDiv.remove(), 500);
                      }, 3000);
                  });
              } else if (data.status === 'success') {
                  // 顯示成功訊息並關閉對話框
                  const dialog = document.getElementById('createProjectDialog');
                  dialog.setAttribute('closing', '');
                  setTimeout(() => {
                      dialog.removeAttribute('closing');
                      dialog.close();
                  }, 200);
                  
                  // 顯示全局成功訊息
                  const successAlert = document.createElement('div');
                  successAlert.className = 'alert alert-success';
                  successAlert.textContent = data.message;
                  document.body.appendChild(successAlert);
                  
                  // 自動消失
                  setTimeout(() => {
                      successAlert.style.transition = "opacity 0.5s";
                      successAlert.style.opacity = "0";
                      setTimeout(() => successAlert.remove(), 500);
                  }, 3000);
                  
                  // 重新加載專案列表
                  location.reload();
              }
          })
          .catch(error => {
              console.error('Error:', error);
              // 顯示通用錯誤訊息
              const alertDiv = document.createElement('div');
              alertDiv.className = 'alert alert-danger';
              alertDiv.textContent = '發生錯誤，請稍後再試。';
              formErrors.appendChild(alertDiv);
          });
      });
  }
});