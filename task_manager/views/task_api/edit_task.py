from django.shortcuts import render
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo
from task_manager.models.task_member import TaskMember
from task_manager.models.project_member import ProjectMember
from django.contrib.auth.models import User

@login_required(login_url="login")
def main(request, task_id):
    if request.method == "POST":
        task = Task.objects.filter(task_id=task_id).first()
        if not task:
            return JsonResponse({'success': False, 'error': 'Task not found.'})

        task.name = request.POST.get('taskName', task.name)
        task.start_date = request.POST.get('startDate', task.start_date)
        task.end_date = request.POST.get('endDate', task.end_date)
        task.content = request.POST.get('content', task.content)
        task.save()

        # --- Handle member editing ---
        member_count = int(request.POST.get("member_count", "0"))
        # Remove old members
        TaskMember.objects.filter(task_id=task).delete()
        # Add new members
        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            try:
                user = User.objects.get(username=member_name, email=member_email)
                TaskMember.objects.create(task_id=task, user_id=user)
            except User.DoesNotExist:
                continue  # Skip if user not found

        return JsonResponse({'success': True})
    
    
    if request.method == "GET":
        context = {
            "task": {},
        }
        
        task = Task.objects.filter(task_id=task_id).first()
        if task:
            context["task"]= {
                "task_id": task.task_id,
                "user_name": task.user_id.username,
                "task_name": task.name,
                "start_date": task.start_date,
                "end_date": task.end_date,
                "content": task.content,
                "progress": task.progress,
                'members':[]
            }
            
        task_members = TaskMember.objects.filter(task_id=task_id)
        
        for task_member in task_members:
            user = task_member.user_id
            try:
                user_info = UserInfo.objects.get(user=user)
                photo_url = user_info.photo.url if user_info.photo else None
            except UserInfo.DoesNotExist:
                photo_url = None

            context['task']['members'].append(
                {
                    "id": user.id,
                    "name": user.username,
                    "email": user.email,
                    "photo": photo_url,
                }
            )
        
        return JsonResponse(context)
    return JsonResponse(context)