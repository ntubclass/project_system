from datetime import datetime
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.project_member import ProjectMember

def global_variables(request):
    project_id = request.GET.get('project', False)
    if project_id != False:
        try:
            project = Project.objects.get(project_id=project_id)
        except Project.DoesNotExist:
            return {
                'project_status': None,
            }
        tasks = Task.objects.filter(project_id=project_id)
        is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
        is_creator = (project.user_id == request.user)
        if not (is_member or is_creator):
            return {
                'project_status': None,
            }
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
        elif project.end_date.date() < today and total_progress < 100:
            status = "已逾期"
        elif today < project.start_date.date():
            status = "未開始"
        else:
            status = "進行中"
        return {
            'project_name': project.name,
            'project_status': status,
        }
    else:
        return {
            'project_status': None,
        }