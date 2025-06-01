from django.shortcuts import render
from django.contrib.auth.models import User
from task_manager.models.user_info import UserInfo
from task_manager.models.project_member import ProjectMember
from django.db.models import Count

def main(request):
    """
    檔案管理主頁面視圖
    """
    # 這裡可以添加檔案相關的數據處理邏輯
    # 例如：取得所有檔案、分類統計等
    
    # 示例數據 - 您可以根據實際需求修改
    files_data = []
    
    # 統計資訊
    total_files = 0
    total_size = 0
    
    context = {
        'files': files_data,
        'total_files': total_files,
        'total_size': total_size,
    }
    
    return render(request, 'files_management.html', context)