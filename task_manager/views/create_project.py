from task_manager.models.project import Project
from django.shortcuts import redirect
from django.http import HttpResponseNotAllowed, JsonResponse
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from datetime import datetime, date
import json

@login_required(login_url='login')  # 確保用戶已登入
def main(request):
    if request.method == "POST":
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        dueDate = request.POST.get("dueDate")
        
        # 使用當前登入的用戶而不是硬編碼用戶名
        user = request.user
        
        # 檢查是否為 AJAX 請求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        errors = []
        
        # 檢查專案名稱是否已存在
        if Project.objects.filter(name=projectName).exists():
            errors.append("專案名稱已存在")
            
        # 檢查截止日期是否在未來
        today = date.today()
        try:
            due_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()
            if due_date_obj <= today:
                errors.append("截止日期必須在今天或之後")
        except ValueError:
            errors.append("請填寫截止日期")
        
        # 如果有錯誤
        if errors:
            if is_ajax:
                return JsonResponse({'status': 'error', 'errors': errors})
            else:
                # 傳統表單提交時的處理
                for error in errors:
                    messages.warning(request, error)
                return redirect('/project/')
        
        # 創建新專案
        new_project = Project(
            name=projectName,
            description=description,
            end_date=dueDate,
            user_id=user
        )
        new_project.save()

        if is_ajax:
            return JsonResponse({'status': 'success', 'message': '專案創建成功'})
        else:
            messages.success(request, "專案創建成功")
            return redirect('/project/')
            
    return HttpResponseNotAllowed(['POST'])