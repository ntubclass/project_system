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

@login_required(login_url="login")
def main(request):
    if not request.user.is_superuser:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')
        
    # 從資料庫取得所有用戶
    users = []
    all_users = User.objects.all()
    for user in all_users:
        try:
            user_info = UserInfo.objects.get(user=user)
            if user_info.photo:
                avatar_url = user_info.photo.url
            else:
                avatar_url = settings.MEDIA_URL + "avatars/avatar_1.png"
        except UserInfo.DoesNotExist:
            avatar_url = settings.MEDIA_URL + "avatars/avatar_1.png"
        # 角色判斷（可根據實際需求調整）
        role = '專案管理者' if user.is_superuser or user.is_staff else '一般使用者'
        # 狀態（10分鐘內有登入、實際建立專案或任務即為『使用中』）
        ten_minutes_ago = timezone.now() - timezone.timedelta(minutes=10)
        recent_login = user.last_login and user.last_login >= ten_minutes_ago
        # 精準判斷：需有 created_at 欄位才可精確判斷建立時間
        recent_project = Project.objects.filter(user_id=user, created_at__gte=ten_minutes_ago).exists() if hasattr(Project, 'created_at') else False
        recent_task = Task.objects.filter(user_id=user, created_at__gte=ten_minutes_ago).exists() if hasattr(Task, 'created_at') else False
        if user.is_active and (recent_login or recent_project or recent_task):
            status = 'active'  # 使用中
        elif not user.is_active:
            status = 'disabled'  # 停用
        else:
            status = 'inactive'  # 未使用
        # 最後活動（可根據實際需求調整，這裡暫用date_joined）
        last_active = user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else user.date_joined.strftime('%Y-%m-%d %H:%M')
        # 專案數（統計用戶作為專案成員或專案負責人的專案總數）
        project_owner_count = ProjectMember.objects.filter(user_id=user).values('project_id').distinct().count()
        project_creator_count = user.project_set.count() if hasattr(user, 'project_set') else 0
        total_project_count = project_owner_count + project_creator_count
        # 計算每個用戶的任務數量
        task_count = Task.objects.filter(user_id=user).count()
        print(f"user: {user.username}, is_active: {user.is_active}, status: {status}")
        users.append({
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'role': role,
            'status': status,
            'last_active': last_active,
            'operations_count': total_project_count,
            'task_count': task_count,
            'avatar_url': avatar_url if not user.is_superuser else settings.MEDIA_URL + "avatars/avatar_1.png",  # superuser顯示預設頭像，其他用戶顯示自己頭像
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
            if user.is_superuser:
                return JsonResponse({'success': False, 'error': '無法停用超級管理員'})
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
            # 只禁止編輯自己的狀態，允許超級管理員編輯其他所有人
            if user.id == request.user.id:
                return JsonResponse({'success': False, 'error': '不能更改自己的狀態'})
            # 狀態處理
            if status == 'active':
                user.is_active = True
            elif status == 'inactive':
                user.is_active = True  # 未使用仍可登入
            elif status == 'disabled':
                user.is_active = False
            user.save()
            return JsonResponse({'success': True})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': '用戶不存在'})
    return JsonResponse({'success': False, 'error': '權限不足或請求錯誤'})
