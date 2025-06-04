import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.file import File
from task_manager.models.project_member import ProjectMember
from task_manager.models.task_member import TaskMember


@login_required
def global_search(request):
    if request.method != 'GET':
        return JsonResponse({'error': '只支援 GET 請求'}, status=405)
    
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({'results': []})
    
    results = []
    user = request.user
    
    try:
        # 取得使用者可存取的專案
        accessible_projects = Project.objects.filter(
            Q(user_id=user) | Q(projectmember__user_id=user)
        ).distinct()
        
        # 搜尋專案
        projects = accessible_projects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )[:5]
        
        for project in projects:
            results.append({
                'type': 'project',
                'icon': 'fa-solid fa-folder',
                'title': project.name,
                'description': project.description[:100] if project.description else '無描述',
                'url': f'/project_detail/{project.project_id}/?project={project.project_id}',
                'meta': f'專案 • {project.start_date.strftime("%Y-%m-%d")}'
            })
        
        # 搜尋任務 (只包含任務建立者和任務成員)
        tasks = Task.objects.filter(
            Q(name__icontains=query) | Q(content__icontains=query)
        ).filter(
            Q(user_id=user) |  # 任務建立者
            Q(taskmember__user_id=user)  # 任務成員
        ).distinct()[:5]
        
        for task in tasks:
            results.append({
                'type': 'task',
                'icon': 'fa-solid fa-tasks',
                'title': task.name,
                'description': task.content[:100] if task.content else '無內容',
                'url': f'/project_task/{task.project_id.project_id}/?project={task.project_id.project_id}',
                'meta': f'任務 • {task.project_id.name}'
            })
        
        # 搜尋檔案
        files = File.objects.filter(
            file_name__icontains=query
        ).filter(
            project_id__in=accessible_projects
        )[:5]
        
        for file in files:
            file_size_mb = round(file.file_size / 1024 / 1024, 2) if file.file_size > 0 else 0
            results.append({
                'type': 'file',
                'icon': get_file_icon(file.file_type),
                'title': file.file_name,
                'description': f'{file.file_type} • {file_size_mb} MB',
                'url': f'/files/{file.project_id.project_id}/?project={file.project_id.project_id}',
                'meta': f'檔案 • {file.project_id.name}'
            })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'results': results})


def get_file_icon(file_type):
    icons = {
        'pdf': 'fa-solid fa-file-pdf',
        'doc': 'fa-solid fa-file-word',
        'docx': 'fa-solid fa-file-word',
        'xls': 'fa-solid fa-file-excel',
        'xlsx': 'fa-solid fa-file-excel',
        'ppt': 'fa-solid fa-file-powerpoint',
        'pptx': 'fa-solid fa-file-powerpoint',
        'jpg': 'fa-solid fa-file-image',
        'jpeg': 'fa-solid fa-file-image',
        'png': 'fa-solid fa-file-image',
        'gif': 'fa-solid fa-file-image',
        'zip': 'fa-solid fa-file-zipper',
        'rar': 'fa-solid fa-file-zipper',
        'txt': 'fa-solid fa-file-lines',
        'csv': 'fa-solid fa-file-csv',
    }
    return icons.get(file_type.lower(), 'fa-solid fa-file')


@login_required
def search_suggestions(request):
    if request.method != 'GET':
        return JsonResponse({'error': '只支援 GET 請求'}, status=405)
    
    query = request.GET.get('q', '').strip()
    if len(query) < 2:
        return JsonResponse({'suggestions': []})
    
    suggestions = []
    user = request.user
    
    try:
        accessible_projects = Project.objects.filter(
            Q(user_id=user) | Q(projectmember__user_id=user)
        ).distinct()
        
        # 專案名稱建議
        projects = accessible_projects.filter(
            name__icontains=query
        ).values_list('name', flat=True)[:3]
        
        suggestions.extend([{'text': name, 'type': 'project'} for name in projects])
        
        # 任務名稱建議 (只包含任務建立者和任務成員)
        tasks = Task.objects.filter(
            name__icontains=query
        ).filter(
            Q(user_id=user) |
            Q(taskmember__user_id=user)
        ).distinct().values_list('name', flat=True)[:3]
        
        suggestions.extend([{'text': name, 'type': 'task'} for name in tasks])
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'suggestions': suggestions[:6]})
