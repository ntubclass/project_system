from django.shortcuts import render
from task_manager.models.project import Project

def main(request):
    context = {}
    project = Project.objects.all()
    for m in project:
        data = {}
        for field in m._meta.fields:
            field_name = field.name
            field_value = getattr(m, field_name)
            data[field_name] = field_value
    context['project'] = data
    return render(request, 'project.html', context)