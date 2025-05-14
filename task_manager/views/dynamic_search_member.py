import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from task_manager.models.project_member import ProjectMember
from task_manager.models.user_info import UserInfo
from task_manager.models.project import Project
from django.db.models import Q
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request):
    if request.method == "POST":
        context = {
            "user_data": [],
        }

        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        search_query = body["search_query"]
        project_id = body["project_id"]

        if not search_query:
            return JsonResponse(context)

        member_ids = []
        # 只搜尋專案成員與管理者，且符合搜尋條件且排除自己
        users = User.objects.filter(
            Q(username__icontains=search_query) | Q(email__icontains=search_query),
        ).exclude(id=request.user.id)
        
        if project_id:
            # 取得專案管理者 id
            try:
                project = Project.objects.get(project_id=project_id)
                manager_id = project.user_id_id  # 根據你的 Project model 欄位名稱調整
            except Project.DoesNotExist:
                manager_id = None

            # 取得專案成員 id
            project_members = ProjectMember.objects.filter(project_id=project_id).values_list('user_id', flat=True)
            member_ids = list(project_members) + [manager_id]
            # 過濾出符合條件的用戶
            users = users.filter(
                Q(id__in=member_ids) | Q(id=manager_id)
            ).exclude(id=request.user.id)
        users = users[:10]
        
        user_data = []
        for user in users:
            try:
                user_info = UserInfo.objects.get(user=user)
                photo_url = user_info.photo.url if user_info.photo else None
            except UserInfo.DoesNotExist:
                photo_url = None

            user_data.append(
                {
                    "id": user.id,
                    "name": user.username,
                    "email": user.email,
                    "photo": photo_url,
                }
            )

        context["user_data"] = user_data
        return JsonResponse(context)

    return JsonResponse({"error": "Invalid request method"}, status=405)