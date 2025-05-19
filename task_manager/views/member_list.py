from django.shortcuts import render, get_object_or_404
from task_manager.models.project_member import ProjectMember
from task_manager.models.project import Project
from task_manager.models.user_info import UserInfo
from django.contrib.auth.models import User

def main(request, project_id):
    # 取得專案
    project = get_object_or_404(Project, project_id=project_id)
    # 取得專案成員
    project_members = ProjectMember.objects.filter(project_id=project)
    members = []
    # 取得專案擁有者
    creator = project.user_id
    try:
        creator_photo = creator.userinfo.photo.url if creator.userinfo.photo else None
    except Exception:
        creator_photo = None
    members.append({
        "name": creator.username,
        "email": creator.email,
        "role": "專案擁有者",
        "photo": creator_photo,
    })
    # 取得其他成員
    for member in project_members:
        user = member.user_id
        # 跳過專案擁有者
        if user.id == creator.id:
            continue
        try:
            photo_url = user.userinfo.photo.url if user.userinfo.photo else None
        except Exception:
            photo_url = None
        members.append({
            "name": user.username,
            "email": user.email,
            "role": "專案成員",
            "photo": photo_url,
        })
    context = {
        "project_id": project_id,
        "members": members,
    }
    return render(request, 'member_list.html', context)
