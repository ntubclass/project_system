import datetime
from task_manager.models.task import Task  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo

@login_required(login_url="login")
def main(request, project_id):
    if request.method == "GET":
        tasks = Task.objects.filter(project_id=project_id)

        context = {
            'tasks_data': []
        }

        for task in tasks:
            status = ""
            today = datetime.datetime.today()
            if task.progress == 100:
                status = "completed"
            elif task.end_date < today and task.progress < 100:
                status = "overdue"
            elif today < task.start_date:
                status = "not-started"
            else:
                status = "in-progress"

            task_data = {
                "id": task.task_id,
                "name": task.name,
                "username": task.user_id.username,
                "user_avatar": UserInfo.objects.get(user_id=task.user_id).photo.url,
                "project_name": task.project_id.name,
                "progress": task.progress,  
                "status": status,
                "start_date": task.start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "end_date": task.end_date.strftime("%Y-%m-%d %H:%M:%S"),
            }
            context['tasks_data'].append(task_data)

        return JsonResponse(context)