from django.shortcuts import render
from task_manager.models.project import Project
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from task_manager.models.project_member import ProjectMember
from datetime import datetime
from task_manager.models.task import Task

@login_required(login_url="login")
def main(request):
    context = {
        "project_data": [],
        "date_now": datetime.now().strftime("%Y-%m-%d"),
    }
    user = User.objects.get(username=request.user)
    member_project_ids = ProjectMember.objects.filter(user_id=user).values_list('project_id', flat=True)
    project = Project.objects.filter(Q(user_id=user) | Q(project_id__in=member_project_ids))
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
                if field_value.id == request.user.id:
                    data["can_edit"] = True
                else:
                    data["can_edit"] = False
                data["photo"] = field_value.userinfo.photo.url

            data[field_name] = field_value
        tasks = Task.objects.filter(project_id=m.project_id)
        total = 0
        for t in tasks:
            total += int(t.progress)
        if total != 0:
            total_progress = int(total/len(tasks))
        else:
            total_progress = 0
        today = datetime.today().date()
        if total_progress == 100:
            status = "已完成"
        elif m.end_date.date() < today and total_progress < 100:
            status = "已逾期"
        elif today < m.start_date.date():
            status = "未開始"
        else:
            status = "進行中"
        data["total_progress"] = total_progress
        data["task_count"] = tasks.count()
        data["status"] = status
        context["project_data"].append(data)
    context["project_data"].sort(key=lambda x: x["total_progress"], reverse=True)
    return render(request, "project.html", context)
