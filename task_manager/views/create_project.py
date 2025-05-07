from django.shortcuts import redirect, get_object_or_404
from django.http import HttpResponseNotAllowed, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.task_member import TaskMember
from task_manager.models.project_member import ProjectMember  # 添加這行
from django.contrib.auth.models import User
from datetime import datetime, date

@login_required(login_url="login")  # 確保用戶已登入
def main(request):  # 移除 project_id 參數，因為這是創建新專案的視圖
    if request.method == "POST":
        projectName = request.POST.get("projectName")
        description = request.POST.get("description")
        dueDate = request.POST.get("dueDate")
        user = User.objects.get(username=request.user)
        member_count = int(request.POST.get("member_count", "0"))

        if Project.objects.filter(name=projectName).exists():
            messages.warning(request, "專案名稱已存在")
            return redirect("/project/")

        today = date.today()  # 現在 date 已正確導入
        due_date_obj = datetime.strptime(dueDate, "%Y-%m-%d").date()
        if due_date_obj <= today:
            messages.warning(request, "截止日期必須在今天或之後")
            return redirect("/project/")

        # 創建新專案
        new_project = Project(
            name=projectName, description=description, end_date=dueDate, user_id=user
        )
        new_project.save()

        for i in range(member_count):
            member_name = request.POST.get(f"member_name_{i}")
            member_email = request.POST.get(f"member_email_{i}")
            user = User.objects.get(username=member_name, email=member_email)
            project_member = ProjectMember(project_id=new_project, user_id=user)
            project_member.save()

        messages.success(request, "專案創建成功")
        return redirect("/project/")
    return HttpResponseNotAllowed(["POST"])

@login_required(login_url="login")
def update_task(request, task_id):
    if request.method == "POST":
        # 獲取任務資訊
        task = get_object_or_404(Task, task_id=task_id)
        project = task.project_id
        
        # 檢查用戶是否有權限更新任務
        is_member = TaskMember.objects.filter(task_id=task, user_id=request.user).exists()
        is_project_creator = (project.user_id == request.user)
        
        if not (is_member or is_project_creator):
            messages.error(request, "您沒有權限更新此任務")
            return redirect('project_detail', project_id=project.project_id)
        
        # 獲取表單數據
        task_name = request.POST.get("taskName", "")
        task_content = request.POST.get("taskContent", "")
        start_date = request.POST.get("startDate", "")
        due_date = request.POST.get("dueDate", "")
        progress = request.POST.get("progress", "0")
        
        # 更新任務資訊
        if task_name:
            task.name = task_name
        
        if task_content:
            task.content = task_content
        
        if start_date:
            try:
                task.start_date = datetime.strptime(start_date, "%Y-%m-%d")
            except ValueError:
                messages.error(request, "開始日期格式無效")
                return redirect('project_detail', project_id=project.project_id)
        
        if due_date:
            try:
                task.end_date = datetime.strptime(due_date, "%Y-%m-%d")
            except ValueError:
                messages.error(request, "截止日期格式無效")
                return redirect('project_detail', project_id=project.project_id)
        
        # 檢查日期邏輯
        if task.end_date < task.start_date:
            messages.error(request, "截止日期不能早於開始日期")
            return redirect('project_detail', project_id=project.project_id)
        
        # 更新進度
        try:
            progress_value = int(progress)
            if 0 <= progress_value <= 100:
                task.progress = progress_value
        except ValueError:
            pass
        
        task.save()
        
        # 處理任務分配（重新分配）
        assignees = request.POST.getlist("assignees[]", [])
        if assignees:
            # 先清除現有分配
            TaskMember.objects.filter(task_id=task).delete()
            
            # 添加新分配
            for assignee_id in assignees:
                try:
                    user = User.objects.get(id=assignee_id)
                    task_member = TaskMember(task_id=task, user_id=user)
                    task_member.save()
                except User.DoesNotExist:
                    continue
        
        messages.success(request, "任務更新成功")
        return redirect('project_detail', project_id=project.project_id)
    
    return HttpResponseNotAllowed(["POST"])

@login_required(login_url="login")
def delete_task(request, task_id):
    if request.method == "POST":
        # 獲取任務資訊
        task = get_object_or_404(Task, task_id=task_id)
        project = task.project_id
        
        # 檢查用戶是否有權限刪除任務（只有專案創建者可以刪除任務）
        if project.user_id != request.user:
            messages.error(request, "您沒有權限刪除此任務")
            return redirect('project_detail', project_id=project.project_id)
        
        # 刪除任務
        task.delete()
        
        messages.success(request, "任務刪除成功")
        return redirect('project_detail', project_id=project.project_id)
    
    return HttpResponseNotAllowed(["POST"])