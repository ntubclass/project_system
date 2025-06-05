from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db.models import Q
from task_manager.models.user_info import UserInfo
from task_manager.models.project_member import ProjectMember
from task_manager.models.task import Task
from task_manager.models.task_member import TaskMember
from django.core.paginator import Paginator
from datetime import datetime, timedelta
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required(login_url="login")
def main(request):
    if not request.user.is_superuser:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')
    # 取得所有任務
    tasks = Task.objects.all()
    
    # 搜尋功能
    search_query = request.GET.get('search', '')
    if search_query:
        tasks = Task.objects.filter(
            Q(name__icontains=search_query) |
            Q(user_id__username__icontains=search_query) |
            Q(project_id__name__icontains=search_query)
        )
        

    # 準備任務數據，包含使用者和專案資訊
    tasks_data = []
    for task in tasks:
        # 獲取任務狀態
        status = ""
        today = datetime.today().date()
        if task.progress == 100:
            status = "已完成"
        elif task.end_date.date() < today and task.progress < 100:
            status = "已逾期"
        elif today < task.start_date.date():
            status = "未開始"
        else:
            status = "進行中"

        # 獲取用戶頭像
        try:
            avatar_url = task.user_id.userinfo.photo.url if hasattr(task.user_id, 'userinfo') and task.user_id.userinfo.photo else None
        except:
            avatar_url = None

        tasks_data.append({
            'task_id': task.task_id,
            'project_id': task.project_id.project_id if hasattr(task.project_id, 'project_id') else None,
            'project_name': task.project_id.name if hasattr(task.project_id, 'name') else '無專案',
            'title': task.name,  # 使用task.name代替title
            'description': task.content,  # 使用task.content代替description
            'status': status,
            'user_name': task.user_id.username if task.user_id else '未指派',
            'user_email': task.user_id.email if task.user_id else '',
            'user_avatar': avatar_url,
            'create_time': task.start_date,  # 使用start_date作為創建時間
            'due_date': task.end_date,  # end_date作為到期日
            'progress': task.progress  # 添加進度字段
        })

    # 分頁處理
    paginator = Paginator(tasks_data, 10)  # 每頁顯示10條任務
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'tasks': page_obj,
        'total_tasks': len(tasks_data),
        'current_page': page_obj.number,
        'total_pages': paginator.num_pages,
        'page_range': paginator.page_range,
        'search_query': search_query,
    }

    return render(request, 'task_management.html', context)