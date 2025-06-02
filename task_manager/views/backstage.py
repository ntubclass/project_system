from django.shortcuts import render
from django.contrib.auth.models import User
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.file import File
from task_manager.utils import hum_convert

def main(request):
    context={
        "total_user": User.objects.count(),
        "total_active": User.objects.filter(is_active=True).count(),
        "total_inactive": User.objects.filter(is_active=False).count(),
        "total_superuser": User.objects.filter(is_superuser=True).count(),
        "total_project": Project.objects.count(),
        "total_task": Task.objects.count(),
        "total_file": File.objects.count(),
        "total_file_size": hum_convert.main(sum(file.file_size for file in File.objects.all())),
    }
    return render(request, "backstage.html", context)