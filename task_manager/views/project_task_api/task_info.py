from django.shortcuts import render
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo
from task_manager.models.project_member import ProjectMember
from django.contrib.auth.models import User

@login_required(login_url="login")
def main(request, task_id):
    if request.method == "GET":
        try:
            # Get the task details
            task = Task.objects.filter(task_id=task_id).first()
            
            if not task:
                return JsonResponse({"error": "Task not found"}, status=404)
            
            # Get creator info
            creator = task.user_id
            try:
                creator_info = UserInfo.objects.get(user=creator)
                creator_photo = creator_info.photo.url if creator_info.photo else None
            except UserInfo.DoesNotExist:
                creator_photo = None
            
            # Format dates for display
            start_date = task.start_date.strftime('%Y-%m-%d') if task.start_date else 'N/A'
            end_date = task.end_date.strftime('%Y-%m-%d') if task.end_date else 'N/A'
            
            # Prepare task data
            task_data = {
                "task_id": task.task_id,
                "task_name": task.name,
                "start_date": start_date,
                "end_date": end_date,
                "content": task.content,
                "progress": task.progress,
                "creator_name": creator.username,
                "creator_photo": creator_photo,
                "members": []
            }
            
            # Get task members
            task_members = TaskMember.objects.filter(task_id=task_id)
            
            for task_member in task_members:
                user = task_member.user_id
                try:
                    user_info = UserInfo.objects.get(user=user)
                    photo_url = user_info.photo.url if user_info.photo else None
                except UserInfo.DoesNotExist:
                    photo_url = None

                task_data['members'].append({
                    "id": user.id,
                    "name": user.username,
                    "email": user.email,
                    "photo": photo_url,
                })
            
            return JsonResponse(task_data)
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request method"}, status=400)