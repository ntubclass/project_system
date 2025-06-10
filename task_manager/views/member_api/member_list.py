from django.shortcuts import render, get_object_or_404, redirect
from task_manager.models.project_member import ProjectMember
from task_manager.models.project import Project
from task_manager.models.user_info import UserInfo
from django.contrib.auth.models import User
from django.contrib import messages

def main(request, project_id):
    # 檢查用戶是否有權限查看此專案（是創建者或成員）
    try:
        project = Project.objects.get(project_id=project_id)
    except Project.DoesNotExist:
        messages.error(request, "專案不存在")
        return redirect('project')
    
    is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
    is_creator = (project.user_id == request.user)
    
    if not (is_member or is_creator):
        # 如果不是專案成員或創建者，返回錯誤訊息
        messages.error(request, "您沒有權限查看此專案")
        return redirect('project')

    if request.method == "POST":
        # 刪除成員
        delete_email = request.POST.get("delete_member_email")
        if delete_email:
            try:
                user = User.objects.get(email=delete_email)
                # 不允許刪除專案擁有者
                if user.id == project.user_id.id:
                    messages.error(request, "不能刪除專案擁有者！")
                else:
                    ProjectMember.objects.filter(project_id=project, user_id=user).delete()
                    messages.success(request, f"已刪除成員 {user.username}")
            except User.DoesNotExist:
                messages.error(request, "找不到該成員")
            return redirect('member_list', project_id=project_id)
        # 新增成員邏輯
        member_count = int(request.POST.get("member_count", 0))
        added = 0
        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            try:
                user = User.objects.get(username=member_name, email=member_email)
                # 避免重複加入
                if not ProjectMember.objects.filter(project_id=project, user_id=user).exists() and user.id != project.user_id.id:
                    ProjectMember.objects.create(project_id=project, user_id=user)
                    added += 1
            except User.DoesNotExist:
                continue
        if added > 0:
            messages.success(request, f"成功新增 {added} 位成員！")
        elif member_count > 0:
            messages.warning(request, "沒有新增任何成員，可能已存在或資料有誤。")
        return redirect('member_list', project_id=project_id)

    # 取得專案
    project = get_object_or_404(Project, project_id=project_id)
    # 取得專案成員
    project_members = ProjectMember.objects.filter(project_id=project)
    members = []
    # 取得專案擁有者
    creator = project.user_id
    try:
        creator_photo = creator.userinfo.photo.url if creator.userinfo.photo else None
        creator_job = creator.userinfo.job if hasattr(creator.userinfo, 'job') else ''
    except Exception:
        creator_photo = None
        creator_job = ''
    members.append({
        "name": creator.username,
        "email": creator.email,
        "role": "專案擁有者",
        "photo": creator_photo,
        "job": creator_job,
    })
    # 取得其他成員
    for member in project_members:
        user = member.user_id
        # 跳過專案擁有者
        if user.id == creator.id:
            continue
        try:
            photo_url = user.userinfo.photo.url if user.userinfo.photo else None
            job = user.userinfo.job if hasattr(user.userinfo, 'job') else ''
        except Exception:
            photo_url = None
            job = ''
        members.append({
            "name": user.username,
            "email": user.email,
            "role": "專案成員",
            "photo": photo_url,
            "job": job,
        })
    
    context = {
        "project_id": project_id,
        "project": project,
        "members": members,
    }
    return render(request, 'member_list.html', context)
