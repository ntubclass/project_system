from task_manager.models.project import Project
from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed

def main(request):
    if request.method == "POST":
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        dueDate = request.POST.get("dueDate")

        new_project = Project(
            name=projectName,
            description=description,
            end_date=dueDate
        )
        new_project.save()
        return redirect('/project/')
    return HttpResponseNotAllowed(['POST'])