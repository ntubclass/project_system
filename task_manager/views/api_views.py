from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from task_manager.models.task import Task
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember

@login_required(login_url="login")
def get_project_tasks(request, project_id):
    """API 端點，獲取專案的任務列表，用於行事曆和甘特圖視圖"""
    try:
        # 檢查使用者是否有權限查看此專案
        is_member = ProjectMember.objects.filter(
            project_id=project_id, 
            user_id=request.user.id
        ).exists()
        
        if not is_member:
            return JsonResponse({"error": "您沒有權限查看此專案"}, status=403)
        
        # 獲取專案的任務列表
        tasks = Task.objects.filter(project_id=project_id)
        
        # 將任務轉換為 JSON 格式
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                "id": task.task_id,
                "name": task.name,
                "start_date": task.start_date.strftime('%Y-%m-%d'),
                "end_date": task.end_date.strftime('%Y-%m-%d'),
                "description": task.description,
                "progress": task.progress,
                "priority": task.priority,
                "status": task.status
            })
        
        return JsonResponse(tasks_data, safe=False)
    except Project.DoesNotExist:
        return JsonResponse({"error": "專案不存在"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)