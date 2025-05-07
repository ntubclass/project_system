from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings

def verify_code_view(request):
    # 檢查session中是否有密碼重置信息
    reset_data = request.session.get('password_reset', None)
    if not reset_data:
        messages.error(request, "密碼重設會話已過期，請重新開始")
        return redirect('forgot_password')
    
    if request.method == 'POST':
        # 獲取用戶輸入的驗證碼
        submitted_code = request.POST.get('code', '')
        email = request.POST.get('email', '')
        
        # 如果提交的郵箱和session中不一致，可能是會話問題
        if email != reset_data['email']:
            messages.error(request, "郵箱信息不匹配，請重新開始")
            return redirect('forgot_password')
        
        # 驗證碼驗證
        if submitted_code == reset_data['code']:
            # 驗證碼正確，標記為已驗證
            reset_data['verified'] = True
            request.session['password_reset'] = reset_data
            
            # 跳轉到重設密碼頁面
            return redirect('reset_password')
        else:
            messages.error(request, "驗證碼不正確，請重新輸入")
    
    # 渲染驗證碼輸入頁面
    context = {
        'email': reset_data['email']
    }
    return render(request, 'verify_code.html', context)

def resend_code_view(request):
    """重新發送驗證碼"""
    if request.method != 'POST':
        return redirect('forgot_password')
    
    email = request.POST.get('email', '')
    reset_data = request.session.get('password_reset', None)
    
    # 檢查會話是否有效
    if not reset_data or email != reset_data['email']:
        messages.error(request, "會話已過期，請重新開始")
        return redirect('forgot_password')
    
    # 更新驗證碼
    import random
    import string
    verification_code = ''.join(random.choices(string.digits, k=6))
    reset_data['code'] = verification_code
    reset_data['verified'] = False
    request.session['password_reset'] = reset_data
    
    # 重新發送郵件
    try:
        subject = '【任務管理系統】密碼重設驗證碼（重新發送）'
        message = f'您的密碼重設驗證碼為: {verification_code}\n\n此驗證碼有效期為10分鐘。如果您沒有申請重設密碼，請忽略此郵件。'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        
        send_mail(subject, message, from_email, recipient_list)
        messages.success(request, "驗證碼已重新發送")
    except Exception as e:
        messages.error(request, f"發送驗證碼失敗，請稍後再試: {str(e)}")
    
    context = {
        'email': email
    }
    return render(request, 'verify_code.html', context)