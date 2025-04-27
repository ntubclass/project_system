from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from task_manager.models.user_info import UserInfo


def register_view(request):
    if request.method == "POST":
        # 獲取表單數據
        full_name = request.POST.get("fullName")
        position = request.POST.get("position")
        email = request.POST.get("email")
        phone = request.POST.get("phone")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirmPassword")

        if password != confirm_password:
            messages.error(request, "密碼不一致，請重新確認")
            return redirect("/register")

        # 檢查電子郵件是否已被使用
        if User.objects.filter(email=email).exists():
            messages.error(request, "此電子郵件已被註冊")
            return redirect("/register")

        user = User.objects.create_user(
            username=full_name, email=email, password=password
        )

        user.save()

        # 創建使用者資訊記錄
        user_info = UserInfo(user=user, job=position, phone=phone)
        user_info.save()

        messages.success(request, "註冊成功！請登入您的帳號")
        return redirect("/login")

    # GET 請求顯示註冊頁面
    return render(request, "register.html")
