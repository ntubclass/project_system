from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from task_manager.models.user_info import UserInfo
from task_manager.models.project_member import ProjectMember
from django.db.models import Count
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from datetime import datetime
from django.utils import timezone
from task_manager.models.project import Project
from task_manager.models.task import Task
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

# 全域 ONLINE_USERS set，需由 signal handler 維護
ONLINE_USERS = globals().get('ONLINE_USERS', set())

@login_required(login_url="login")
def main(request):
    if not request.user.is_superuser:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')
    users = []
    all_users = User.objects.all()
    for user in all_users:
        try:
            user_info = UserInfo.objects.get(user=user)
            if user_info.photo:
                avatar_url = user_info.photo.url
            else:
                avatar_url = settings.MEDIA_URL + "avatars/avatar_1.png"
            is_online = user_info.is_online  # 直接用 user_info 物件
        except UserInfo.DoesNotExist:
            avatar_url = settings.MEDIA_URL + "avatars/avatar_1.png"
            is_online = False
        role = '專案管理者' if user.is_superuser or user.is_staff else '一般使用者'
        # 狀態只分啟用/停用
        status = 'active' if user.is_active else 'disabled'
        # 活動狀態改為根據 UserInfo.is_online 欄位判斷
        last_active = user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else user.date_joined.strftime('%Y-%m-%d %H:%M')
        project_owner_count = ProjectMember.objects.filter(user_id=user).values('project_id').distinct().count()
        project_creator_count = user.project_set.count() if hasattr(user, 'project_set') else 0
        total_project_count = project_owner_count + project_creator_count
        task_count = Task.objects.filter(user_id=user).count()
        users.append({
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'role': role,
            'status': status,
            'is_online': is_online,
            'last_active': last_active,
            'operations_count': total_project_count,
            'task_count': task_count,
            'avatar_url': avatar_url if not user.is_superuser else settings.MEDIA_URL + "avatars/avatar_1.png",
        })

    total_users = len(users)
    current_page = 1
    total_pages = 1
    page_range = range(1, total_pages + 1)

    context = {
        'users': users,
        'total_users': total_users,
        'current_page': current_page,
        'total_pages': total_pages,
        'page_range': page_range,
    }

    return render(request, 'user_management.html', context)

@csrf_exempt
@login_required(login_url="login")
def delete_user(request):
    if request.method == 'POST' and request.user.is_superuser:
        user_id = request.POST.get('user_id')
        if not user_id:
            return JsonResponse({'success': False, 'error': '缺少 user_id'})
        try:
            user = User.objects.get(id=user_id)
            # 允許超級管理員停用其他超級管理員，但不能停用自己
            if user.id == request.user.id:
                return JsonResponse({'success': False, 'error': '不能停用自己'})
            user.is_active = False
            user.save()
            return JsonResponse({'success': True})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': '用戶不存在'})
    return JsonResponse({'success': False, 'error': '權限不足或請求錯誤'})

@csrf_exempt
@login_required(login_url="login")
def edit_user(request):
    if request.method == 'POST' and request.user.is_superuser:
        user_id = request.POST.get('user_id')
        status = request.POST.get('status')
        role = request.POST.get('role')
        if not user_id:
            return JsonResponse({'success': False, 'error': '缺少 user_id'})
        try:
            user = User.objects.get(id=user_id)
            # 允許超級管理員編輯自己
            # 狀態處理
            if status == 'active':
                user.is_active = True
            elif status == 'disabled':
                user.is_active = False
            user.save()
            return JsonResponse({'success': True})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': '用戶不存在'})
    return JsonResponse({'success': False, 'error': '權限不足或請求錯誤'})
