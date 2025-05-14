from django.shortcuts import render
from task_manager.models.task import Task  
from task_manager.models.project import Project
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

@login_required(login_url="login")
def main(request, project_id):
    if request.method == "GET":
        tasks = Task.objects.filter(project_id=project_id)

        context = {
            'tasks_data': []
        }

        for task in tasks:
            task_data = {
                "id": task.task_id,
                "name": task.name,
                "project_name": task.project_id.name,
                "progress": task.progress,  
                "start_date": task.start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "end_date": task.end_date.strftime("%Y-%m-%d %H:%M:%S"),
            }
            context['tasks_data'].append(task_data)

        return JsonResponse(context)