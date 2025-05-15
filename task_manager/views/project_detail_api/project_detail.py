from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages  # 添加這一行導入 messages
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.project_member import ProjectMember
from datetime import datetime

@login_required(login_url="login")
def main(request, project_id):
    # 獲取專案資訊
    project = get_object_or_404(Project, project_id=project_id)
    
    # 檢查用戶是否有權限查看此專案（是創建者或成員）
    is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
    is_creator = (project.user_id == request.user)
    
    if not (is_member or is_creator):
        # 如果不是專案成員或創建者，返回錯誤訊息
        messages.error(request, "您沒有權限查看此專案")
        return redirect('project')
    
    # 獲取專案任務
    tasks = Task.objects.filter(project_id=project_id)
    
    # 分類任務
    ongoing_tasks = []
    completed_tasks = []
    
    for task in tasks:
        task_data = {
            "id": task.task_id,
            "name": task.name,
            "content": task.content,
            "start_date": task.start_date,
            "end_date": task.end_date,
            "progress": 75,  # 這裡應該從數據庫獲取或計算
            "assignees": [],  # 這裡需要獲取任務負責人
        }
        
        # 將任務添加到對應類別中
        # 實際情況下，應該根據任務的完成狀態進行判斷
        if task.task_id % 2 == 0:  # 假設偶數ID為已完成任務
            completed_tasks.append(task_data)
        else:
            ongoing_tasks.append(task_data)
    
    # 獲取專案成員
    project_members = ProjectMember.objects.filter(project_id=project_id)
    members = []
    
    for member in project_members:
        user = member.user_id
        try:
            photo_url = user.userinfo.photo.url if user.userinfo.photo else None
        except:
            photo_url = None
        
        members.append({
            "id": user.id,
            "name": user.username,
            "email": user.email,
            "photo": photo_url,
        })
    
    # 添加專案創建者
    creator = project.user_id
    try:
        creator_photo = creator.userinfo.photo.url if creator.userinfo.photo else None
    except:
        creator_photo = None
    
    creator_data = {
        "id": creator.id,
        "name": creator.username,
        "email": creator.email,
        "photo": creator_photo,
        "is_creator": True
    }
    
    # 確保創建者不會被重複添加
    if not any(member["id"] == creator.id for member in members):
        members.append(creator_data)
    
    # 準備模板上下文
    context = {
        "project_id": project_id,
        "members": members,
        "ongoing_tasks": ongoing_tasks,
        "completed_tasks": completed_tasks,
        "ongoing_count": len(ongoing_tasks),
        "completed_count": len(completed_tasks),
        "date_now": datetime.now().strftime("%Y-%m-%d"),
    }
    
    return render(request, "project_detail.html", context)