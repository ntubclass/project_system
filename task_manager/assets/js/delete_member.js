// 用於成員管理頁面，刪除專案成員
function deleteMember(memberEmail, memberName) {
    Swal.fire({
        title: "確認刪除成員",
        text: `您確定要刪除成員 \"${memberName}\" 嗎？`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "刪除",
        cancelButtonText: "取消",
    }).then((result) => {
        if (result.isConfirmed) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const formData = new URLSearchParams();
            formData.append('delete_member_email', memberEmail);
            fetch(window.location.pathname, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: formData
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                    return null;
                }
                return response.text();
            })
            .then(data => {
                // 若有訊息可在此處理
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: "刪除失敗",
                    text: "伺服器錯誤，請稍後再試！",
                });
            });
        }
    });
}
