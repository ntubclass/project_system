from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.shortcuts import redirect
from django.urls import reverse
from allauth.exceptions import ImmediateHttpResponse

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        if not sociallogin.is_existing:
            # 新用戶，將社交帳號資訊存入 session
            request.session['socialaccount_data'] = {
                'name': sociallogin.account.extra_data.get('name', ''),
                'email': sociallogin.account.extra_data.get('email', ''),
                'provider': sociallogin.account.provider,
                'uid': sociallogin.account.uid,
            }
            
            # 中斷正常登入流程，重定向到註冊頁面
            raise ImmediateHttpResponse(redirect(reverse('register')))
            
        # 如果用戶已存在，正常登入
        return super().pre_social_login(request, sociallogin)