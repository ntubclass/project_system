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

@login_required(login_url="login")
def main(request, project_id): 
    if request.method == "POST":
        taskName = request.POST.get("taskName")
        content = request.POST.get("content")
        dueDate = request.POST.get("startDate")
        dueDate = request.POST.get("dueDate")
        user = User.objects.get(username=request.user)
        member_count = int(request.POST.get("member_count", "0"))

        start_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()
        due_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()
        
        project = Project.objects.get(project_id=project_id)
        
        if due_date_obj < start_date_obj:
            messages.warning(request, "截止日期必須在開始日期之後")
            return redirect(f"/project_detail/{project_id}")
        
        if project.start_date.date() > start_date_obj:
            messages.warning(request, "開始日期必須在專案開始日期之後")
            return redirect(f"/project_detail/{project_id}")
        
        if project.end_date.date() < due_date_obj:
            messages.warning(request, "截止日期必須在專案截止日期之前")
            return redirect(f"/project_detail/{project_id}")

        # 創建新專案
        new_task = Task(
            project_id=project, name=taskName, content=content, end_date=dueDate
        )
        new_task.save()

        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            user = User.objects.get(username=member_name, email=member_email)
            task_member = TaskMember(task_id=new_task.task_id, user_id=user)
            task_member.save()

        messages.success(request, "任務已成功創建")
        return redirect(f"/project_detail/{project_id}")
    return HttpResponseNotAllowed(["POST"])