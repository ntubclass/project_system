from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User

def reset_password_view(request):
    # 獲取會話中的密碼重置信息
    reset_data = request.session.get('password_reset', None)
    
    # 檢查會話是否有效且已驗證
    if not reset_data or not reset_data.get('verified', False):
        messages.error(request, "驗證會話已過期或未通過驗證，請重新開始")
        return redirect('forgot_password')
    
    if request.method == 'POST':
        # 獲取表單數據
        email = request.POST.get('email', '')
        code = request.POST.get('code', '')
        new_password = request.POST.get('new_password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        # 驗證表單數據與會話數據是否一致
        if email != reset_data['email'] or code != reset_data['code']:
            messages.error(request, "驗證信息不匹配，請重新開始")
            return redirect('forgot_password')
        
        # 驗證密碼
        if new_password != confirm_password:
            messages.error(request, "兩次輸入的密碼不一致")
            context = {
                'email': reset_data['email'],
                'code': reset_data['code']
            }
            return render(request, 'reset_password.html', context)
        
        if len(new_password) < 8:
            messages.error(request, "密碼長度必須至少為8個字符")
            context = {
                'email': reset_data['email'],
                'code': reset_data['code']
            }
            return render(request, 'reset_password.html', context)
        
        try:
            # 更新用戶密碼
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            # 清除會話中的密碼重置信息
            if 'password_reset' in request.session:
                del request.session['password_reset']
                
            messages.success(request, "密碼已成功重設，請使用新密碼登入")
            return redirect('login')
            
        except User.DoesNotExist:
            messages.error(request, "找不到對應的用戶，請重新開始")
            return redirect('forgot_password')
        except Exception as e:
            messages.error(request, f"密碼重設失敗: {str(e)}")
            context = {
                'email': reset_data['email'],
                'code': reset_data['code']
            }
            return render(request, 'reset_password.html', context)
            
    # GET請求直接渲染重設密碼頁面
    context = {
        'email': reset_data['email'],
        'code': reset_data['code']
    }
    return render(request, 'reset_password.html', context)