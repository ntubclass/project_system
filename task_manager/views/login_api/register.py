from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from task_manager.models.user_info import UserInfo
from allauth.socialaccount.models import SocialAccount, SocialApp

def register_view(request):
    social_data = request.session.get('socialaccount_data', None)
    if request.method == "POST":
        # 獲取表單數據
        full_name = request.POST.get("fullName")
        position = request.POST.get("position")
        email = request.POST.get("email")
        phone = request.POST.get("phone","")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirmPassword")

        if password != confirm_password:
            messages.error(request, "密碼不一致，請重新確認")
            return redirect("/register")
        
        if len(password) < 8:
            messages.error(request, "密碼長度必須至少為8個字符")
            return redirect("/register")
        
        if User.objects.filter(username=full_name).exists():
            messages.error(request, "此用戶名已被註冊")
            return redirect("/register")

        if User.objects.filter(email=email).exists():
            messages.error(request, "此電子郵件已被註冊")
            return redirect("/register")

        user = User.objects.create_user(
            username=full_name, email=email, password=password
        )
        user.save()

        user_info = user.userinfo
        user_info.phone = phone
        user_info.job = position
        user_info.save()

        if social_data:
            SocialAccount.objects.create(
                user=user,
                provider=social_data['provider'],
                uid=social_data['uid'],
                extra_data=social_data
            )
            
            # 清除 session 數據
            del request.session['socialaccount_data']

        messages.success(request, "註冊成功！請重新登入您的帳號")
        return redirect("/login")

    social_data = request.session.get('socialaccount_data', None)
    initial_data = {}

    if social_data:
        # 使用社交帳號數據預填表單
        initial_data = {
            'name': social_data.get('name', ''),
            'email': social_data.get('email', ''),
            # 其他欄位...
        }
        
    context = {
        'initial_data': initial_data,
    }

    # GET 請求顯示註冊頁面
    return render(request, "register.html", context)
