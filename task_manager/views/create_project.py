from task_manager.models.project import Project
from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed
from django.contrib.auth.models import User
from django.contrib import messages
from task_manager.models.project_member import ProjectMember

def main(request):
    if request.method == "POST":
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        dueDate = request.POST.get("dueDate")
        user = User.objects.get(username = "linjerry")
        member_count = int(request.POST.get("member_count", "0"))

        if Project.objects.filter(name=projectName).exists():
            messages.warning(request, "專案已存在")
            return redirect('/project/')

        new_project = Project(
            name=projectName,
            description=description,
            end_date=dueDate,
            user_id = user
        )
        new_project.save()

        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            user = User.objects.get(username = member_name, email = member_email)
            project_member = ProjectMember(
                project_id=new_project,
                user_id=user
            )
            project_member.save()

        messages.success(request, "專案創建成功")
        return redirect('/project/')
    return HttpResponseNotAllowed(['POST'])