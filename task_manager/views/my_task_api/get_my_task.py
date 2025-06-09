from datetime import datetime
from task_manager.models.task import Task  
from task_manager.models.task_member import TaskMember  
from task_manager.models.project import Project  
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from task_manager.models.user_info import UserInfo
from task_manager.models.project_member import ProjectMember
from django.db.models import Q

@login_required(login_url="login")
def main(request):
    if request.method == "GET":
        # 找出用戶是成員的專案
        member_project_ids = ProjectMember.objects.filter(
            user_id=request.user
        ).values_list('project_id', flat=True)
        
        # 找出用戶是管理者的專案
        managed_project_ids = Project.objects.filter(
            user_id=request.user
        ).values_list('project_id', flat=True)
        
        # 合併用戶是成員或管理者的所有專案ID
        user_project_ids = list(set(list(member_project_ids) + list(managed_project_ids)))
        
        # 獲取用戶創建的任務（僅限用戶是成員或管理者的專案）
        created_tasks = Task.objects.filter(
            user_id=request.user, 
            project_id__in=user_project_ids
        )
        
        # 獲取用戶是成員但不是創建者的任務
        member_task_ids = TaskMember.objects.filter(
            user_id=request.user
        ).values_list('task_id', flat=True)
        
        participate_tasks = Task.objects.filter(
            task_id__in=member_task_ids,
            project_id__in=user_project_ids
        ).exclude(user_id=request.user)

        context = {
            'tasks_data': [],
        }

        # 處理我創建的任務
        for task in created_tasks:
            # 檢查用戶是否是此專案的管理者
            is_manager = task.project_id.project_id in managed_project_ids
            
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

            try:
                avatar_url = UserInfo.objects.get(user=task.user_id).photo.url
            except:
                avatar_url = None
                
            # Get task members and their avatars
            members = TaskMember.objects.filter(task_id=task.task_id).select_related('user_id__userinfo')
            member_count = members.count() + 1  # +1 for task owner
            
            # Get avatars
            member_avatars = []
            # First add task owner avatar
            if avatar_url:
                member_avatars.append(avatar_url)
            
            # Then add members' avatars
            for member in members:
                try:
                    member_avatar_url = member.user_id.userinfo.photo.url
                    member_avatars.append(member_avatar_url)
                except:
                    # If a member doesn't have an avatar, skip
                    continue

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
                "is_manager": is_manager,  # 添加管理者狀態到回應
                "member_count": member_count,
                "member_avatars": member_avatars,
            }
            context['tasks_data'].append(task_data)
        
        # 處理我參與的任務（成員但不是創建者）
        for task in participate_tasks:
            # 檢查用戶是否是此專案的管理者
            is_manager = task.project_id.project_id in managed_project_ids
            
            status = ""
            today = datetime.today().date()
            if task.progress == 100:
                status = "completed"
            elif task.end_date.date() < today and task.progress < 100:
                status = "overdue"
            elif today < task.start_date.date():
                status = "not-started"
            else:
                status = "in-progress"
                
            try:
                avatar_url = UserInfo.objects.get(user=task.user_id).photo.url
            except:
                avatar_url = None
                
            # Get task members and their avatars
            members = TaskMember.objects.filter(task_id=task.task_id).select_related('user_id__userinfo')
            member_count = members.count() + 1  # +1 for task owner
            
            # Get avatars
            member_avatars = []
            # First add task owner avatar
            if avatar_url:
                member_avatars.append(avatar_url)
            
            # Then add members' avatars
            for member in members:
                try:
                    member_avatar_url = member.user_id.userinfo.photo.url
                    member_avatars.append(member_avatar_url)
                except:
                    # If a member doesn't have an avatar, skip
                    continue

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
                "is_manager": is_manager,  # 添加管理者狀態到回應
                "member_count": member_count,
                "member_avatars": member_avatars,
            }
            context['tasks_data'].append(task_data)

        return JsonResponse(context)