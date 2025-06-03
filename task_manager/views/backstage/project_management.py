from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember
from task_manager.models.task import Task
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required(login_url="login")
def main(request):
    if not request.user.is_superuser and not request.user.is_staff:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')
        
    search_query = request.GET.get('search', '').strip()
    
    # 根據搜尋條件篩選專案
    if search_query:
        # 使用 Q 物件進行多欄位搜尋
        project = Project.objects.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    else:
        project = Project.objects.all()
    project_data = []
    for m in project:
        data = {}
        for field in m._meta.fields:
            field_name = field.name
            field_value = getattr(m, field_name)

            if field_name == "end_date":
                if field_value is not None:
                    field_value = field_value.strftime("%Y-%m-%d")
                else:
                    field_value = ""
            elif field_name == "start_date":
                if field_value is not None:
                    field_value = field_value.strftime("%Y-%m-%d")
                else:
                    field_value = ""
            elif field_name == "user_id":
                data["user_name"] = field_value.username

            data[field_name] = field_value
        
        # Calculate total progress and task count
        tasks = Task.objects.filter(project_id=m.project_id)
        total_progress = sum(int(t.progress) for t in tasks) if tasks else 0
        total_tasks = tasks.count()

        project_members = ProjectMember.objects.filter(project_id=m.project_id)
        member_amount = project_members.count()+1
        
        data["total_progress"] = int(total_progress / total_tasks) if total_tasks > 0 else 0
        data["task_count"] = total_tasks
        data["member_amount"] = member_amount
        project_data.append(data)

    paginator = Paginator(project_data, 10)
    try:
        page_number = int(request.GET.get('page', 1))
    except ValueError:
        page_number = 1
    page_obj = paginator.get_page(page_number)

    start_index = (page_obj.number - 1) * paginator.per_page + 1
    end_index = min(page_obj.number * paginator.per_page, paginator.count)

    context = {
        "project_data": page_obj,
        "total_project": paginator.count,
        "current_page": page_number,
        'total_pages': paginator.num_pages,
        'page_range': paginator.page_range,
        'start_index': start_index,
        'end_index': end_index,
        'search_query': search_query,
    }
    return render(request, 'project_management.html', context)