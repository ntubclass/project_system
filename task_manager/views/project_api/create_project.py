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
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        startDate = request.POST.get("startDate")
        dueDate = request.POST.get("dueDate")
        user = User.objects.get(username=request.user)
        member_count = int(request.POST.get("member_count", "0"))

        today = date.today()
        start_date_obj = datetime.strptime(startDate, "%Y-%m-%d").date()
        due_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()

        # if due_date_obj < today:
        #     messages.warning(request, "截止日期必須在今天或之後")
        #     return redirect("/project/")
        # elif start_date_obj < today:
        #     messages.warning(request, "開始日期必須在今天或之後")
        #     return redirect("/project/")
        # elif due_date_obj < start_date_obj:
        #     messages.warning(request, "截止日期必須在開始日期之後")
        #     return redirect("/project/")

        # 創建新專案
        new_project = Project(
            name=projectName, description=description, start_date=startDate, end_date=dueDate, user_id=user
        )
        new_project.save()

        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            user = User.objects.get(username=member_name, email=member_email)
            project_member = ProjectMember(project_id=new_project, user_id=user)
            project_member.save()

        messages.success(request, "專案創建成功")
        return redirect("/project/")
    return HttpResponseNotAllowed(["POST"])
