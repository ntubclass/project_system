from django.contrib.auth.decorators import login_required
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember
from django.contrib.auth.models import User
from django.contrib import messages
from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed

@login_required(login_url="login")
def main(request):
    if request.method == "POST":
        project_id = request.POST.get("project_id")
        new_owner_id = request.POST.get("new_owner_id")
        current_owner_id = request.POST.get("current_owner_id")

        model_project = Project.objects.get(project_id=project_id)
        model_project.user_id = User.objects.get(id=new_owner_id)
        model_project.save()
        try:
            model_project_member = ProjectMember.objects.get(project_id=model_project,user_id=User.objects.get(id=new_owner_id))
        except ProjectMember.DoesNotExist:
            model_project_member = ProjectMember()
        model_project_member.project_id = model_project
        model_project_member.user_id = User.objects.get(id=current_owner_id)
        model_project_member.save()

        messages.success(request, "專案擁有者已成功更改")

        return redirect("/project_management/")
    return HttpResponseNotAllowed(["POST"])