from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages  # 添加這一行導入 messages
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.project_member import ProjectMember
from datetime import date

@login_required(login_url="login")
def main(request, project_id):
    try:
        project = Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        messages.error(request, "專案不存在")
        return redirect('project')
    
    # 檢查用戶是否有權限查看此專案（是創建者或成員）
    is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
    is_creator = (project.user_id == request.user)
    
    if not (is_member or is_creator):
        # 如果不是專案成員或創建者，返回錯誤訊息
        messages.error(request, "您沒有權限查看此專案")
        return redirect('project')
    
    # 獲取專案任務
    tasks = Task.objects.filter(project_id=project_id)

    total = 0
    for t in tasks:
        total += int(t.progress)
    if total != 0:
        total_progress = int(total/len(tasks))
    else:
        total_progress = 0
    
    # 獲取專案成員
    project_members = ProjectMember.objects.filter(project_id=project_id)
    member_amount = project_members.count()+1

    #計算專案結束日期
    today = date.today()
    diff = project.end_date.date() - today
    if diff.days <=0:
        end_date_diff = f"已過期{-diff.days}"
    else:
        end_date_diff = diff.days
    
    context = {
        "project_id": project_id,
        "total_progress": total_progress,
        "member_amount": member_amount,
        "end_date": project.end_date.strftime("%Y-%m-%d"),
        "end_date_diff": end_date_diff,
    }
    
    return render(request, "project_detail.html", context)