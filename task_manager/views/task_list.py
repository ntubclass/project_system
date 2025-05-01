from django.shortcuts import render
from task_manager.models.task import Task  # 導入您的Task模型
from task_manager.models.project import Project  # 導入Project模型，用於顯示專案名稱
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request):
    # 獲取所有任務
    tasks = Task.objects.all()

    # 將任務分為進行中和已完成兩類
    ongoing_tasks = []
    completed_tasks = []

    # 這裡假設您有某種方式來判斷任務是否完成
    # 如果您的Task模型中有status欄位，可以根據它來劃分
    # 這裡使用簡單的邏輯作為示例
    for task in tasks:
        task_data = {
            "id": task.task_id,
            "name": task.name,
            "project_name": task.project_id.name,  # 顯示關聯的專案名稱
            "progress": 75,  # 進度值，實際應從數據庫獲取或計算
            "date": task.end_date,
        }

        # 這裡應根據您的業務邏輯判斷任務是否完成
        # 例如，可以添加一個 is_completed 欄位到 Task 模型
        # 這裡使用一個臨時邏輯，假設一半任務已完成
        if task.task_id % 2 == 0:  # 偶數ID為已完成
            completed_tasks.append(task_data)
        else:
            ongoing_tasks.append(task_data)

    context = {
        "ongoing_tasks": ongoing_tasks,
        "completed_tasks": completed_tasks,
        "ongoing_count": len(ongoing_tasks),
        "completed_count": len(completed_tasks),
    }

    return render(request, "task_list.html", context)
