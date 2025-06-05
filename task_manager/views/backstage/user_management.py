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
        # 狀態（5分鐘內有登入紀錄顯示「使用中」，否則顯示「未使用」）
        if user.is_active and user.last_login:
            try:
                now = timezone.now()
                last_login = user.last_login
                # 若 last_login 沒有 tzinfo，直接用 naive now 比較
                if last_login.tzinfo is None:
                    diff = (datetime.now() - last_login).total_seconds()
                else:
                    diff = (now - last_login).total_seconds()
            except Exception:
                diff = 999999
            if diff < 300:
                status = 'active'  # 使用中
            else:
                status = 'inactive'  # 未使用
        else:
            status = 'inactive'  # 未使用
        # 最後活動（可根據實際需求調整，這裡暫用date_joined）
        last_active = user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else user.date_joined.strftime('%Y-%m-%d %H:%M')
        # 專案數
        operations_count = ProjectMember.objects.filter(user_id=user).count()
        users.append({
            'id': user.id,
            'name': user.username,
            'email': user.email,
            'role': role,
            'status': status,
            'last_active': last_active,
            'operations_count': operations_count,
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
