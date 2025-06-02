from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember  # 添加這行
from django.contrib.auth.models import User
from datetime import datetime, date

@login_required(login_url="login")
def main(request):
    if request.method == "POST":
        projectID = request.POST.get("projectID")
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        startDate = request.POST.get("startDate")
        dueDate = request.POST.get("dueDate")
        member_count = int(request.POST.get("member_count", "0"))

        start_date_obj = datetime.strptime(startDate, "%Y-%m-%d").date()
        due_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()
        if due_date_obj < start_date_obj:
            messages.warning(request, "截止日期必須在開始日期之後")
            return redirect("/project/")

        model_project = Project.objects.get(project_id=projectID)
        if model_project.user_id.id != request.user.id:
            messages.error(request, "您沒有權限編輯此專案")
            return redirect("/project/")
        model_project.name = projectName
        model_project.description = description
        model_project.start_date = startDate
        model_project.end_date = dueDate
        model_project.save()

        ProjectMember.objects.filter(project_id=model_project).delete()
        
        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            user = User.objects.get(username=member_name, email=member_email)
            project_member = ProjectMember(project_id=model_project, user_id=user)
            project_member.save()

        messages.success(request, "專案更新成功")
        return redirect("/project/")
    return HttpResponseNotAllowed(["POST"])
