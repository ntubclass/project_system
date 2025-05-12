from django.shortcuts import render
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

@login_required(login_url="login")
def main(request, project_id):
    context = {
        "project_id": project_id,
        "my_tasks": [],
        "participate_tasks": [],
    }

    my_tasks = Task.objects.filter(project_id=project_id, user_id=request.user)
    participate_tasks = TaskMember.objects.filter(task_id__project_id=project_id, user_id=request.user)

    for task in my_tasks:
        context["my_tasks"].append({
            "task_id": task.task_id,
            "user_name": task.user_id.username,
            "task_name": task.name,
            "end_date": task.end_date,
            "content": task.content,
            "progress": task.progress,
        })

    for task_member in participate_tasks:
        task = task_member.task_id
        context["participate_tasks"].append({
            "task_id": task.task_id,
            "user_name": task.user_id.username,
            "task_name": task.name,
            "end_date": task.end_date,
            "content": task.content,
            "progress": task.progress,
        })
    
    return render(request, "project_task.html", context)