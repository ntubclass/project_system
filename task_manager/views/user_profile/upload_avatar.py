from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseNotAllowed
from django.contrib import messages
from task_manager.models.user_info import UserInfo

@login_required
def upload_avatar(request):
    """處理用戶頭像上傳的視圖函數"""
    if request.method == "POST":
        user_info = UserInfo.objects.get(user=request.user)
        avatar_file = request.FILES.get("avatar_file")
        
        # 檢查是否有上傳文件
        if avatar_file:
            user_info.photo = avatar_file
            user_info.save()
            messages.success(request, '頭像已成功更新！')
        else:
            messages.error(request, '上傳失敗，請選擇有效的圖片文件。')
            
        return redirect('user_profile')
    else:
        return HttpResponseNotAllowed(['POST'])