document.addEventListener("DOMContentLoaded", function () {
  function setup_dialog(dialogId, cancelBtnId, closeBtnId) {
    const dialog = document.getElementById(dialogId);
    const cancelBtn = document.getElementById(cancelBtnId);
    const closeBtn = document.getElementById(closeBtnId);

    function closeDialogWithAnimation() {
      dialog.setAttribute("closing", "");
      setTimeout(() => {
        dialog.removeAttribute("closing");
        dialog.close();
      }, 200);
    }

    if (dialog) {
      dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          closeDialogWithAnimation();
        }
      });

      dialog.addEventListener("cancel", (e) => {
        e.preventDefault();
        closeDialogWithAnimation();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        closeDialogWithAnimation();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeDialogWithAnimation();
      });
    }
  }

  // 綁定所有 .btn-edit 按鈕
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const taskId = this.getAttribute('data-task-id');

      // 設定 taskId 到表單 data 屬性，確保 submit 時能取得
      const form = document.getElementById('editTaskForm');
      if (form) {
        form.setAttribute('data-task-id', taskId);
      }

      fetch(`/edit_task/${taskId}`)
        .then(response => response.json())
        .then(data => {
          const task = data.task || {};

          document.getElementById('taskName').value = task.task_name || '';
          document.getElementById('startDate').value = (task.start_date || '').split('T')[0];
          document.getElementById('endDate').value = (task.end_date || '').split('T')[0];
          document.getElementById('content').value = task.content || '';

          const membersList = document.getElementById('membersList');
          addMemberlist.length = 0;
          membersList.innerHTML = '';
          if (task.members && Array.isArray(task.members)) {
            task.members.forEach(member => {
              const li = document.createElement('li');
              li.innerHTML = `
                <div>
                  <img src="${member.photo || '/static/default-avatar.png'}" class="user-photo">
                  <span class="user-name">${member.name}</span>
                  <span class="user-email">${member.email}</span>
                </div>
              `;
              membersList.appendChild(li);
              addMemberlist.push({
                name: member.name,
                email: member.email,
                photo: member.photo || '/static/default-avatar.png',
              });
            });
          }

          const dialog = document.getElementById('editTaskDialog');
          if (dialog) dialog.showModal();
        })
        .catch(err => {
          console.error('取得任務資料失敗:', err);
        });
    });
  });

  // 表單送出時 fetch POST
  document.getElementById('editTaskForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const taskId = this.getAttribute('data-task-id');
    if (!taskId) {
      alert('找不到任務 ID，請重新打開編輯視窗');
      return;
    }
    addMemberlist.forEach((member, index) => {
        const nameInput = document.createElement('input');
        nameInput.type = 'hidden';
        nameInput.name = `member_name_${index}`;
        nameInput.value = member.name;

        const emailInput = document.createElement('input');
        emailInput.type = 'hidden';
        emailInput.name = `member_email_${index}`;
        emailInput.value = member.email;
        
        this.appendChild(nameInput);
        this.appendChild(emailInput);
    });

    // 添加成員數量的隱藏欄位
    const countInput = document.createElement('input');
    countInput.type = 'hidden';
    countInput.name = 'member_count';
    countInput.value = addMemberlist.length;
    this.appendChild(countInput);


    const formData = new FormData(this);

    fetch(`/edit_task/${taskId}/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
      },
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById('editTaskDialog').close();
        } else {
          // alert(data.error || '更新失敗');
        }
      })
      .catch(err => {
        console.error('更新任務失敗:', err);
      });
  });

  setup_dialog(
    "editTaskDialog",
    "cancelEditTaskBtn",
    "closeEditTaskBtn"
  );
});