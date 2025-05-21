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
        is_member_list = body.get("is_member_list", False)

        if not search_query:
            return JsonResponse(context)

        users = User.objects.filter(
            Q(username__icontains=search_query) | Q(email__icontains=search_query),
        ).exclude(id=request.user.id)

        if project_id:
            project_members = ProjectMember.objects.filter(project_id=project_id).values_list('user_id', flat=True)
            member_ids = list(project_members)
            try:
                project = Project.objects.get(project_id=project_id)
                manager_id = project.user_id_id
            except Project.DoesNotExist:
                manager_id = None

            if manager_id and manager_id not in member_ids:
                member_ids.append(manager_id)

            if is_member_list:
                # 只顯示「不是這個專案成員」的用戶
                users = users.exclude(id__in=member_ids)
            else:
                # 只顯示「是這個專案成員」的用戶
                users = users.filter(id__in=member_ids)

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