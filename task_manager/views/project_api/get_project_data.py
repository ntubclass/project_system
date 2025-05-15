# 在 views/project_api/ 目錄下新增檔案 get_project_data.py

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember

@login_required(login_url="login")
def main(request, project_id):
    try:
        project = Project.objects.get(project_id=project_id)
        
        # 檢查用戶權限
        if project.user_id.id != request.user.id:
            return JsonResponse({"error": "您沒有權限編輯此專案"}, status=403)
        
        # 獲取專案成員
        project_members = ProjectMember.objects.filter(project_id=project)
        members_data = []
        
        for member in project_members:
            members_data.append({
                "username": member.user_id.username,
                "email": member.user_id.email,
                "photo": member.user_id.userinfo.photo.url
            })
        
        project_data = {
            "name": project.name,
            "description": project.description,
            "start_date": project.start_date.strftime('%Y-%m-%d'),
            "end_date": project.end_date.strftime('%Y-%m-%d'),
            "progress": project.progress,
            "members": members_data
        }

        print(project_data)
        
        return JsonResponse(project_data)
        
    except Project.DoesNotExist:
        return JsonResponse({"error": "專案不存在"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)