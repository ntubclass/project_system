from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from task_manager.models.user_info import UserInfo

def register_view(request):
    if request.method == 'POST':
        # 獲取表單數據
        full_name = request.POST.get('fullName')
        position = request.POST.get('position')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirmPassword')
        agree_terms = request.POST.get('agreeTerms') == 'on'
        
        # 基本表單驗證
        # if not agree_terms:
        #     messages.error(request, '請同意服務條款和隱私政策')
        #     return render(request, 'register.html')
        
        if password != confirm_password:
            messages.error(request, '密碼不一致，請重新確認')
            return render(request, 'register.html')
        
        # 檢查電子郵件是否已被使用
        if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            messages.error(request, '此電子郵件已被註冊')
            return render(request, 'register.html')
        
        # 創建新使用者
        try:
            # 使用電子郵件作為用戶名
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )
            
            # 設置使用者姓名
            name_parts = full_name.split(' ', 1)
            if len(name_parts) > 1:
                user.first_name = name_parts[0]
                user.last_name = name_parts[1]
            else:
                user.first_name = full_name
            
            user.save()
            
            # 創建使用者資訊記錄
            user_info = UserInfo(
                user=user,
                job=position,
                phone=phone
            )
            user_info.save()
            
            messages.success(request, '註冊成功！請登入您的帳號')
            return redirect('login')
            
        except Exception as e:
            messages.error(request, f'註冊過程中發生錯誤：{str(e)}')
            return render(request, 'register.html')
    
    # GET 請求顯示註冊頁面
    return render(request, 'register.html')