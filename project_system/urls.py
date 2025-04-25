from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.shortcuts import redirect
from task_manager.views import (
    project,
    task_list,
    login,
    register,
    create_project,
    dynamic_search_member,
)

# 添加一個簡單的首頁視圖函數來確保重定向
def home_redirect(request):
    return redirect('project')

urlpatterns = [
    # 設置首頁重定向（使用函數視圖來直接重定向到專案頁面）
    path('', home_redirect, name='home'),
    
    # 認證相關路由
    path('login/', login.login_view, name='login'),
    path('register/', register.register_view, name='register'),
    # path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    
    # 專案相關路由
    path('project/', project.main, name='project'),
    path('create_project/', create_project.main, name='create_project'),
    path('dynamic_search_member/', dynamic_search_member.main, name='dynamic_search_member'),
    
    # 任務相關路由
    path('task_list/', task_list.main, name='task_list'),
]