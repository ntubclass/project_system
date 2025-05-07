from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.core.mail import send_mail
import random
import string
from django.conf import settings

def generate_verification_code():
    """產生6位隨機數字驗證碼"""
    return ''.join(random.choices(string.digits, k=6))

def forgot_password_view(request):
    if request.method == 'POST':
        email = request.POST.get('email', '')
        
        # 檢查郵箱是否存在
        if not User.objects.filter(email=email).exists():
            messages.error(request, "此電子郵件不存在，請重新輸入")
            return render(request, 'forgot_password.html')
        
        # 產生驗證碼並存儲在會話中
        verification_code = generate_verification_code()
        request.session['password_reset'] = {
            'email': email,
            'code': verification_code,
            'verified': False
        }
        
        # 發送驗證碼郵件
        try:
            subject = '【任務管理系統】密碼重設驗證碼'
            message = f'您的密碼重設驗證碼為: {verification_code}\n\n此驗證碼有效期為10分鐘。'
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            
            send_mail(subject, message, from_email, recipient_list)
            
            # 重定向到驗證碼輸入頁面
            return redirect('verify_code')
            
        except Exception as e:
            messages.error(request, f"發送驗證碼失敗，請稍後再試: {str(e)}")
            return render(request, 'forgot_password.html')
    
    # GET請求直接渲染忘記密碼頁面
    return render(request, 'forgot_password.html')