from django.shortcuts import redirect, get_object_or_404
from django.http import HttpResponseNotAllowed, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.task_member import TaskMember
from task_manager.models.project_member import ProjectMember  # 添加這行
from django.contrib.auth.models import User
from datetime import datetime, date

@login_required(login_url="login")  # 確保用戶已登入
def main(request):  # 移除 project_id 參數，因為這是創建新專案的視圖
    if request.method == "POST":
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        dueDate = request.POST.get("dueDate")
        user = User.objects.get(username=request.user)
        member_count = int(request.POST.get("member_count", "0"))

        if Project.objects.filter(name=projectName).exists():
            messages.warning(request, "專案名稱已存在")
            return redirect("/project/")

        today = date.today()  # 現在 date 已正確導入
        due_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()
        if due_date_obj <= today:
            messages.warning(request, "截止日期必須在今天或之後")
            return redirect("/project/")

        # 創建新專案
        new_project = Project(
            name=projectName, description=description, end_date=dueDate, user_id=user
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
