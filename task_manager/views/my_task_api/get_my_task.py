import datetime
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo
from task_manager.models.project_member import ProjectMember
from django.db.models import Q

@login_required(login_url="login")
def main(request):
    if request.method == "GET":
        # Get projects the user is a member of
        user_project_ids = ProjectMember.objects.filter(
            user_id=request.user
        ).values_list('project_id', flat=True)
        
        # Get tasks created by the user (only in projects the user is a member of)
        created_tasks = Task.objects.filter(
            user_id=request.user, 
            project_id__in=user_project_ids
        )
        
        # Get tasks where the user is a member but not the creator
        member_task_ids = TaskMember.objects.filter(user_id=request.user).values_list('task_id', flat=True)
        participate_tasks = Task.objects.filter(
            task_id__in=member_task_ids,
            project_id__in=user_project_ids
        ).exclude(user_id=request.user)

        context = {
            'tasks_data': [],
        }

        # Process my tasks (created by me)
        for task in created_tasks:
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

            try:
                avatar_url = UserInfo.objects.get(user=task.user_id).photo.url
            except:
                avatar_url = None

            task_data = {
                "id": task.task_id,
                "project_id": task.project_id.project_id,
                "name": task.name,
                "username": task.user_id.username,
                "user_avatar": avatar_url,
                "project_name": task.project_id.name,
                "progress": task.progress,  
                "status": status,
                "start_date": task.start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "end_date": task.end_date.strftime("%Y-%m-%d %H:%M:%S"),
                "description": task.content,
            }
            context['tasks_data'].append(task_data)
        
        # Process participate tasks (member but not creator)
        for task in participate_tasks:
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

            try:
                avatar_url = UserInfo.objects.get(user=task.user_id).photo.url
            except:
                avatar_url = None

            task_data = {
                "id": task.task_id,
                "project_id": task.project_id.project_id,
                "name": task.name,
                "username": task.user_id.username,
                "user_avatar": avatar_url,
                "project_name": task.project_id.name,
                "progress": task.progress,  
                "status": status,
                "start_date": task.start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "end_date": task.end_date.strftime("%Y-%m-%d %H:%M:%S"),
                "description": task.content,
            }
            context['tasks_data'].append(task_data)

        return JsonResponse(context)