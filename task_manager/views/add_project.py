from task_manager.models.project import Project
from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed
from django.contrib.auth.models import User
from django.contrib import messages

def main(request):
    if request.method == "POST":
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        dueDate = request.POST.get("dueDate")
        user = User.objects.get(username = "linjerry")

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

        messages.success(request, "專案創建成功")
        return redirect('/project/')
    return HttpResponseNotAllowed(['POST'])