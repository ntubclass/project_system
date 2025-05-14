from django.shortcuts import render
from task_manager.models.project import Project
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from task_manager.models.project_member import ProjectMember
from datetime import datetime

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
                    field_value = field_value.strftime("%Y/%m/%d")
                else:
                    field_value = ""
            elif field_name == "start_date":
                if field_value is not None:
                    field_value = field_value.strftime("%Y/%m/%d")
                else:
                    field_value = ""
            elif field_name == "user_id":
                user = User.objects.get(id=field_value.id)
                data["photo"] = user.userinfo.photo.url

            data[field_name] = field_value
        context["project_data"].append(data)
    return render(request, "project.html", context)
