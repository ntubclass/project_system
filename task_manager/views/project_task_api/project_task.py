from datetime import datetime
from django.contrib import messages
from django.shortcuts import redirect, render
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request, project_id):
    context = {
        "project_id": project_id,
        "my_tasks": [],
        "participate_tasks": [],
        "date_now": datetime.now().strftime("%Y-%m-%d"),
    }
    
     # 檢查用戶是否有權限查看此專案（是創建者或成員）
    try:
        project = Project.objects.get(project_id=project_id)
        context["project"] = project  # 將 project 物件加入 context
    except Project.DoesNotExist:
        messages.error(request, "專案不存在")
        return redirect('project')
    
    is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
    is_creator = (project.user_id == request.user)
    
    if not (is_member or is_creator):
        # 如果不是專案成員或創建者，返回錯誤訊息
        messages.error(request, "您沒有權限查看此專案")
        return redirect('project')

    my_tasks = Task.objects.filter(project_id=project_id, user_id=request.user)
    participate_task_ids = TaskMember.objects.filter(
        task_id__project_id=project_id,
        user_id=request.user
    ).values_list('task_id', flat=True)
    participate_tasks = Task.objects.filter(task_id__in=participate_task_ids).exclude(user_id=request.user)


    for task in my_tasks:
        status = ""
        today = datetime.today().date()  # Get just the date part
        if task.progress == 100:
            status = "completed"
        elif task.end_date.date() < today and task.progress < 100:
            status = "overdue"
        elif today < task.start_date.date():
            status = "not-started"
        else:
            status = "in-progress"

        context["my_tasks"].append({
            "task_id": task.task_id,
            "user_name": task.user_id.username,
            "task_name": task.name,
            "end_date": task.end_date.strftime('%Y-%m-%d'),  # Format datetime to string
            "content": task.content,
            "progress": task.progress,
            "status": status,
            'photo': task.user_id.userinfo.photo.url,
        })

    for task_member in participate_tasks:
        task = task_member

        status = ""
        today = datetime.today().date()  # Get just the date part
        if task.progress == 100:
            status = "completed"
        elif task.end_date.date() < today and task.progress < 100:
            status = "overdue"
        elif today < task.start_date.date():
            status = "not-started"
        else:
            status = "in-progress"

        context["participate_tasks"].append({
            "task_id": task.task_id,
            "user_name": task.user_id.username,
            "task_name": task.name,
            "end_date": task.end_date.strftime('%Y-%m-%d'),  # Format datetime to string
            "content": task.content,
            "progress": task.progress,
            "status": status,
            'photo':  task.user_id.userinfo.photo.url,        })
    # 移除會導致雙重重新導向的 url_type 設定，因為 create_task.py 現在直接構造 URL
    # context["url_type"] = f"/project_task/{project_id}/?project={project_id}"
    
    return render(request, "project_task.html", context)