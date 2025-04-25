from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('email')  # 使用email作為使用者名稱
        password = request.POST.get('password')
        remember_me = request.POST.get('remember-me') == 'on'
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # 設置session過期時間
            if not remember_me:
                request.session.set_expiry(0)  # 關閉瀏覽器時session過期
            return redirect('project')  # 登入後重定向到專案頁面
        else:
            messages.error(request, '帳號或密碼不正確')
    
    return render(request, 'login.html')