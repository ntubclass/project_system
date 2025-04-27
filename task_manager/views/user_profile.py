from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from task_manager.models.user_info import UserInfo
from django.contrib.auth.models import User
from django.conf import settings
import os

@login_required(login_url="login")
def main(request):
    # 获取所有用户的头像信息
    all_users = User.objects.all()
    all_user_photo = {}
    
    for user in all_users:
        try:
            user_info = UserInfo.objects.get(user=user)
            if user_info.photo:
                all_user_photo[user.username] = user_info.photo.url
            else:
                all_user_photo[user.username] = settings.MEDIA_URL + "avatars/avatar_1.png"
        except UserInfo.DoesNotExist:
            all_user_photo[user.username] = settings.MEDIA_URL + "avatars/avatar_1.png"
    
    # 获取当前用户信息
    current_user_info = UserInfo.objects.get(user=request.user)
    
    context = {
        "user_info": current_user_info,
        "all_user_photo": all_user_photo
    }
    
    return render(request, "user_profile.html", context)