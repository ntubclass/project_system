from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.task_member import TaskMember
from task_manager.models.project_member import ProjectMember
from django.contrib.auth.models import User
from datetime import datetime, date
from django.urls import reverse

@login_required(login_url="login")
def main(request, project_id): 
    if request.method == "POST":
        taskName = request.POST.get("taskName")
        content = request.POST.get("content")
        startDate = request.POST.get("startDate")
        dueDate = request.POST.get("dueDate")
        # url_type 變數已移除，因為現在直接構造重定向 URL
        user = User.objects.get(username=request.user)
        project = Project.objects.get(project_id=project_id)
        member_count = int(request.POST.get("member_count", "0"))
        
        # 檢查用戶是否有權限查看此專案（是創建者或成員）
        is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
        is_creator = (project.user_id == request.user)
    
        if not (is_member or is_creator):
            messages.error(request, "您沒有權限新增此專案任務")
            # 直接重定向到最終目標，避免雙重重定向
            redirect_url = reverse('project_task', kwargs={'project_id': project_id}) + f'?project={project_id}'
            return redirect(redirect_url)

        start_date_obj = datetime.strptime(startDate, "%Y-%m-%d").date()
        due_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()
        
        if due_date_obj < start_date_obj:
            messages.warning(request, "截止日期必須在開始日期之後")
            redirect_url = reverse('project_task', kwargs={'project_id': project_id}) + f'?project={project_id}'
            return redirect(redirect_url)
        
        if project.start_date.date() > start_date_obj:
            messages.warning(request, "開始日期必須在專案開始日期之後")
            redirect_url = reverse('project_task', kwargs={'project_id': project_id}) + f'?project={project_id}'
            return redirect(redirect_url)
        
        if project.end_date.date() < due_date_obj:
            messages.warning(request, "截止日期必須在專案截止日期之前")
            redirect_url = reverse('project_task', kwargs={'project_id': project_id}) + f'?project={project_id}'
            return redirect(redirect_url)
        
        # 創建新專案
        new_task = Task(
            user_id=user,  project_id=project, name=taskName, content=content, start_date=startDate, end_date=dueDate
        )
        new_task.save()

        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            user = User.objects.get(username=member_name, email=member_email)
            task_member = TaskMember(task_id=new_task, user_id=user)
            task_member.save()

        messages.success(request, "任務已成功創建")

        # 直接構造重定向 URL，避免雙重重定向
        redirect_url = reverse('project_task', kwargs={'project_id': project_id}) + f'?project={project_id}'
        return redirect(redirect_url)
    return HttpResponseNotAllowed(["POST"])