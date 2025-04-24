from django.shortcuts import render
from task_manager.models.project import Project

def main(request):
    context = {}
    project = Project.objects.all()
    
    project_list = []
    
    for m in project:
        data = {}
        for field in m._meta.fields:
            field_name = field.name
            field_value = getattr(m, field_name)
            data[field_name] = field_value
        project_list.append(data)
        
    context['project'] = project_list
    return render(request, 'project.html', context)