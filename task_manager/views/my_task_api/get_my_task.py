from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo
from django.db.models import Q

@login_required(login_url="login")
def main(request):
    if request.method == "GET":
        # Get tasks created by the user
        created_tasks = Task.objects.filter(user_id=request.user)
        
        # Get tasks where the user is a member
        member_task_ids = TaskMember.objects.filter(user_id=request.user).values_list('task_id', flat=True)
        member_tasks = Task.objects.filter(task_id__in=member_task_ids)
        
        # Combine both querysets and remove duplicates
        all_tasks = created_tasks | member_tasks
        all_tasks = all_tasks.distinct()

        context = {
            'tasks_data': []
        }

        for task in all_tasks:
            task_data = {
                "id": task.task_id,
                "name": task.name,
                "username": task.user_id.username,
                "user_avatar": UserInfo.objects.get(user_id=task.user_id).photo.url,
                "project_name": task.project_id.name,
                "progress": task.progress,  
                "start_date": task.start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "end_date": task.end_date.strftime("%Y-%m-%d %H:%M:%S"),
            }
            context['tasks_data'].append(task_data)

        return JsonResponse(context)
    