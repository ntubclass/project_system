from django.shortcuts import render, get_object_or_404
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo
from task_manager.models.task_member import TaskMember
from task_manager.models.task_history import TaskHistory
from django.utils import timezone

@login_required
def main(request, task_id):
    # Get task by ID or return 404
    task = get_object_or_404(Task, task_id=task_id)
    
    if request.method == "POST":
        # Get form data
        info = request.POST.get('info', '').strip()
        progress_str = request.POST.get('progress', '0')
        
        # Validate form data
        if not info:
            return JsonResponse({
                'success': False, 
                'error': '請填寫事項'
            })
        
        try:
            progress = int(progress_str)
            if progress < 0 or progress > 100:
                raise ValueError("Progress out of range")
        except ValueError:
            return JsonResponse({
                'success': False, 
                'error': '進度必須是0-100之間的數字'
            })
        
        # Check if user is authorized to update this task
        user = request.user
        
        # Option 1: Check if user is a task member
        is_member = TaskMember.objects.filter(task_id=task, user_id=user).exists()
        
        # Option 2: Check if user is the task creator
        is_creator = task.user_id == user
        
        if not (is_member or is_creator):
            return JsonResponse({
                'success': False, 
                'error': '您沒有權限更新此任務'
            })
        
        try:
            # Create a new task history entry
            task_history = TaskHistory(
                task_id=task,
                user_id=user,
                info=info,
                progress=progress,
                updated_at=timezone.now()
            )
            task_history.save()
            
            # Update task's current progress
            task.progress = progress
            task.updated_at = timezone.now()
            task.save()
            
            return JsonResponse({
                'success': True,
                'message': '任務進度已更新',
                'new_progress': progress
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'更新失敗: {str(e)}'
            })
    
    elif request.method == "GET":
        # Get task history for this task
        task_history = TaskHistory.objects.filter(task_id=task).order_by('-updated_at')
        
        # Count progress occurrences
        progress_counts = {}
        latest_progress = None
        
        history_data = []
        for history in task_history:
            # Count each progress value
            progress_value = history.progress
            if progress_value in progress_counts:
                progress_counts[progress_value] += 1
            else:
                progress_counts[progress_value] = 1
            
            # Track the latest progress (first in the list since ordered by -updated_at)
            if latest_progress is None:
                latest_progress = progress_value
                
            history_item = {
                'task_history_id': history.task_history_id,
                'user': history.user_id.username,
                'info': history.info,
                'progress': progress_value,
                'updated_at': history.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            }
            history_data.append(history_item)
        
        context = {
            "history": history_data,
            "progress_counts": progress_counts,
            "latest_progress": latest_progress,
            "total_updates": len(history_data),
            "success": True
        }
        
        return JsonResponse(context)