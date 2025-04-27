from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib import messages
from task_manager.models.user_info import UserInfo

@login_required
def main(request):
    """用户个人资料页面视图"""
    # 获取当前登录用户信息
    user = request.user
    
    try:
        # 获取用户扩展信息
        user_info = UserInfo.objects.get(user=user)
    except UserInfo.DoesNotExist:
        # 如果不存在则创建一个空记录
        user_info = UserInfo(user=user, job="", phone="", bio="")
        user_info.save()
    
    # 处理表单提交
    if request.method == 'POST':
        form_type = request.POST.get('form_type')
        
        # 处理基本信息表单
        if form_type == 'profile':
            # 更新用户信息
            user.username = request.POST.get('name', user.username)
            user.email = request.POST.get('email', user.email)
            user.save()
            
            # 更新扩展信息
            user_info.job = request.POST.get('job', user_info.job)
            user_info.phone = request.POST.get('phone', user_info.phone)
            user_info.bio = request.POST.get('bio', user_info.bio)
            user_info.save()
            
            messages.success(request, '個人資料已更新成功！')
            return redirect('user_profile')
            
        # 处理密码修改表单
        elif form_type == 'password':
            current_password = request.POST.get('current_password', '')
            new_password = request.POST.get('new_password', '')
            confirm_password = request.POST.get('confirm_password', '')
            
            # 验证当前密码是否正确 - 使用邮箱作为用户名
            if not authenticate(username=user.email, password=current_password):
                messages.error(request, '目前密碼不正確，請重新輸入')
                return redirect('user_profile')
                
            # 验证新密码是否与确认密码一致
            if new_password != confirm_password:
                messages.error(request, '兩次輸入的新密碼不一致，請重新輸入')
                return redirect('user_profile')
                
            # 验证新密码长度
            if len(new_password) < 8:
                messages.error(request, '密碼長度至少需要8個字符')
                return redirect('user_profile')
                
            # 修改密码
            user.set_password(new_password)
            user.save()
            
            messages.success(request, '密碼已成功修改，請重新登入')
            return redirect('login')
    
    context = {
        'user': user,
        'user_info': user_info
    }
    
    return render(request, 'user_profile.html', context)