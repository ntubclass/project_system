from django.shortcuts import render, redirect
from task_manager.models.project import Project
from django.contrib.auth.decorators import login_required

def main(request):
    context = {
        "project_data": [],
    }
    project = Project.objects.all()
    
    for m in project:
        data = {}
        for field in m._meta.fields:
            field_name = field.name
            field_value = getattr(m, field_name)

            if field_name == "end_date" and field_value is not None:
                field_value = field_value.strftime("%Y/%m/%d")

            data[field_name] = field_value
        context['project_data'].append(data)
    return render(request, 'project.html', context)