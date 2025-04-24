from django.shortcuts import render
from task_manager.models.project import Project

def main(request):
    context = {
        "project_data": [],
    }
    project = Project.objects.all()
    
    project_list = []
    
    for m in project:
        data = {}
        for field in m._meta.fields:
            field_name = field.name
            field_value = getattr(m, field_name)

            if field_name == "end_date":
                field_value = field_value.strftime("%Y/%m/%d")

            data[field_name] = field_value
        context['project_data'].append(data)
    return render(request, 'project.html', context)