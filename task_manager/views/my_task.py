from django.shortcuts import render
from task_manager.models.task import Task  # 導入您的Task模型
from task_manager.models.project import Project  # 導入Project模型，用於顯示專案名稱
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request):
    return render(request, "my_task.html")
