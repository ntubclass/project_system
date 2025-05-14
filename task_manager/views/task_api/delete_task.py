from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from task_manager.models.task import Task
from task_manager.models.task_member import TaskMember
from task_manager.models.task_history import TaskHistory
from task_manager.models.project_member import ProjectMember

@login_required(login_url="login")
def main(request, task_id): 
    if request.method == "POST":
        task = Task.objects.get(task_id=task_id)
        project = task.project_id

        is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
        is_creator = (project.user_id == request.user)
    
        if not (is_member or is_creator):
            messages.error(request, "您沒有權限刪除此專案任務")
            return redirect('project')
        
        # Delete related task history records
        TaskHistory.objects.filter(task_id=task).delete()
        
        # Delete related task member records
        TaskMember.objects.filter(task_id=task).delete()
        
        # Delete the task itself
        task.delete()

        return JsonResponse({"message": "Task deleted successfully."}, status=200)
    else:
        return HttpResponseNotAllowed(["DELETE"])
