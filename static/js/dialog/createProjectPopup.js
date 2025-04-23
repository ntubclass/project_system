document.addEventListener('DOMContentLoaded', function() {
    // 獲取對話框元素
    const createProjectDialog = document.getElementById('createProjectDialog');
    const createProjectForm = document.getElementById('createProjectForm');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const openCreateProjectBtn = document.getElementById('openCreateProjectBtn');
    
    // 打開專案創建對話框
    function openCreateProjectDialog() {
        createProjectDialog.classList.add('active');
        console.log("對話框已開啟");
    }
    
    // 關閉專案創建對話框
    function closeCreateProjectDialog() {
        createProjectDialog.classList.remove('active');
        console.log("對話框已關閉");
    }
    
    // 事件監聽器設置
    
    // 開啟創建專案對話框
    if (openCreateProjectBtn) {
        openCreateProjectBtn.addEventListener('click', openCreateProjectDialog);
        console.log("已設置開啟按鈕監聽器");
    }
    
    // 關閉創建專案對話框
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', closeCreateProjectDialog);
        console.log("已設置關閉按鈕監聽器");
    }
    
    // 點擊背景關閉對話框
    createProjectDialog.addEventListener('click', function(e) {
        if (e.target === createProjectDialog) {
            closeCreateProjectDialog();
        }
    });
    
    // 阻止表單提交事件的默認行為
    createProjectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // 這裡可以加入您自己的表單處理邏輯
        console.log('表單提交');
        // 提交後關閉對話框
        closeCreateProjectDialog();
    });
});