import datetime
from task_manager.models.task import Task  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo
from datetime import datetime
from task_manager.models.task_member import TaskMember

@login_required(login_url="login")
def main(request, project_id):
    if request.method == "GET":
        tasks = Task.objects.filter(project_id=project_id)

        context = {
            'tasks_data': []
        }

        for task in tasks:
            status = ""
            today = datetime.today().date()  # Get just the date part
            if task.progress == 100:
                status = "completed"
            elif task.end_date.date() < today and task.progress < 100:
                status = "overdue"
            elif today < task.start_date.date():
                status = "not-started"
            else:
                status = "in-progress"
                
            # Get task members and their avatars
            members = TaskMember.objects.filter(task_id=task.task_id).select_related('user_id__userinfo')
            member_count = members.count() + 1  # +1 for task owner
            
            # Get avatars
            member_avatars = []
            # First add task owner avatar
            try:
                member_avatars.append(UserInfo.objects.get(user_id=task.user_id).photo.url)
            except:
                # If owner doesn't have an avatar
                pass
            
            # Then add members' avatars
            for member in members:
                try:
                    avatar_url = member.user_id.userinfo.photo.url
                    member_avatars.append(avatar_url)
                except:
                    # If a member doesn't have an avatar, skip
                    continue
                
            task_data = {
                "id": task.task_id,
                "project_id": task.project_id.project_id,
                "name": task.name,
                "username": task.user_id.username,
                "user_avatar": UserInfo.objects.get(user_id=task.user_id).photo.url,
                "project_name": task.project_id.name,
                "progress": task.progress,  
                "status": status,
                "description": task.content,
                "start_date": task.start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "end_date": task.end_date.strftime("%Y-%m-%d %H:%M:%S"),
                "member_count": member_count,
                "member_avatars": member_avatars,
            }
            context['tasks_data'].append(task_data)

        # Define status priority for sorting (lower number = higher priority)
        status_priority = {
            "in-progress": 1,
            "overdue": 2, 
            "not-started": 3,
            "completed": 4
        }
        
        # Sort tasks by status priority
        context['tasks_data'].sort(key=lambda x: status_priority.get(x['status'], 5))

        return JsonResponse(context)