from django.shortcuts import render
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request, project_id):
    context = {
        "project_id": project_id,
        "my_tasks": [],
        "participate_tasks": [],
    }

    my_tasks = Task.objects.filter(project_id=project_id, user_id=request.user)
    participate_task_ids = TaskMember.objects.filter(
        task_id__project_id=project_id,
        user_id=request.user
    ).values_list('task_id', flat=True)
    participate_tasks = Task.objects.filter(task_id__in=participate_task_ids).exclude(user_id=request.user)

    for task in my_tasks:
        context["my_tasks"].append({
            "task_id": task.task_id,
            "user_name": task.user_id.username,
            "task_name": task.name,
            "end_date": task.end_date,
            "content": task.content,
            "progress": task.progress,
            'photo': task.user_id.userinfo.photo.url,
        })

    for task_member in participate_tasks:
        task = task_member
        context["participate_tasks"].append({
            "task_id": task.task_id,
            "user_name": task.user_id.username,
            "task_name": task.name,
            "end_date": task.end_date,
            "content": task.content,
            "progress": task.progress,
            'photo':  task.user_id.userinfo.photo.url,
        })
    
    return render(request, "project_task.html", context)