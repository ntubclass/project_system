from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.file import File
from task_manager.utils import hum_convert, system_info, chart_data
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from datetime import datetime
from task_manager.models.message import Message
import json
import logging

# Create logger
logger = logging.getLogger(__name__)

@login_required(login_url="login")
def main(request):
    if not request.user.is_superuser:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')
    
    # Get system information
    uptime_info = system_info.get_system_uptime()
    system_stats = system_info.get_system_stats()
    
    # Calculate project status counts
    today = datetime.today().date()
    projects = Project.objects.all()
    project_completed = 0
    project_overdue = 0
    project_not_started = 0
    project_in_progress = 0
    
    for project in projects:
        project_tasks = Task.objects.filter(project_id=project.project_id)
        total_progress = sum(int(task.progress) for task in project_tasks) if project_tasks else 0
        total_tasks = project_tasks.count()
        project_progress = int(total_progress / total_tasks) if total_tasks > 0 else 0
        
        if project_progress == 100:
            project_completed += 1
        elif project.end_date.date() < today and project_progress < 100:
            project_overdue += 1
        elif today < project.start_date.date():
            project_not_started += 1
        else:
            project_in_progress += 1
    
    # Calculate task status counts
    tasks = Task.objects.all()
    task_completed = 0
    task_overdue = 0
    task_not_started = 0
    task_in_progress = 0
    
    for task in tasks:
        if task.progress == 100:
            task_completed += 1
        elif task.end_date.date() < today and task.progress < 100:
            task_overdue += 1
        elif today < task.start_date.date():
            task_not_started += 1
        else:
            task_in_progress += 1
    
    # Calculate percentages
    total_projects = Project.objects.count()
    total_tasks = Task.objects.count()
    
    project_completed_percent = (project_completed / total_projects * 100) if total_projects > 0 else 0
    project_overdue_percent = (project_overdue / total_projects * 100) if total_projects > 0 else 0
    project_not_started_percent = (project_not_started / total_projects * 100) if total_projects > 0 else 0
    project_in_progress_percent = (project_in_progress / total_projects * 100) if total_projects > 0 else 0
    
    task_completed_percent = (task_completed / total_tasks * 100) if total_tasks > 0 else 0
    task_overdue_percent = (task_overdue / total_tasks * 100) if total_tasks > 0 else 0
    task_not_started_percent = (task_not_started / total_tasks * 100) if total_tasks > 0 else 0
    task_in_progress_percent = (task_in_progress / total_tasks * 100) if total_tasks > 0 else 0
    
    # Calculate message totals
    total_messages = Message.objects.count()
    
    pi_chart_data = {
        "total_user": User.objects.count(),
        "total_active": User.objects.filter(is_active=True).count(),
        "total_inactive": User.objects.filter(is_active=False).count(),
        "total_superuser": User.objects.filter(is_superuser=True).count(),
        "total_project": Project.objects.count(),
        "total_task": Task.objects.count(),
        "total_file": File.objects.count(),
        # Project status data
        "project_completed": project_completed,
        "project_overdue": project_overdue,
        "project_not_started": project_not_started,
        "project_in_progress": project_in_progress,
        # Project percentages
        "project_completed_percent": project_completed_percent,
        "project_overdue_percent": project_overdue_percent,
        "project_not_started_percent": project_not_started_percent,
        "project_in_progress_percent": project_in_progress_percent,
        # Task status data
        "task_completed": task_completed,
        "task_overdue": task_overdue,
        "task_not_started": task_not_started,
        "task_in_progress": task_in_progress,
        # Task percentages
        "task_completed_percent": task_completed_percent,
        "task_overdue_percent": task_overdue_percent,
        "task_not_started_percent": task_not_started_percent,
        "task_in_progress_percent": task_in_progress_percent,
    }
        
    context={
        "total_user": User.objects.count(),
        "total_active": User.objects.filter(is_active=True).count(),
        "total_inactive": User.objects.filter(is_active=False).count(),
        "total_superuser": User.objects.filter(is_superuser=True).count(),
        "total_project": Project.objects.count(),
        "total_task": Task.objects.count(),
        "total_file": File.objects.count(),
        "total_file_size": hum_convert.main(sum(file.file_size for file in File.objects.all())),
        "pi_chart_data": pi_chart_data,
        # Adding the project and task status counts directly to context as well
        "project_completed": project_completed,
        "project_overdue": project_overdue,
        "project_not_started": project_not_started,
        "project_in_progress": project_in_progress,
        "project_completed_percent": project_completed_percent,
        "project_overdue_percent": project_overdue_percent,
        "project_not_started_percent": project_not_started_percent,
        "project_in_progress_percent": project_in_progress_percent,
        "task_completed": task_completed,
        "task_overdue": task_overdue,
        "task_not_started": task_not_started,
        "task_in_progress": task_in_progress,
        "task_completed_percent": task_completed_percent,
        "task_overdue_percent": task_overdue_percent,
        "task_not_started_percent": task_not_started_percent,
        "task_in_progress_percent": task_in_progress_percent,
        "total_messages": total_messages,
        # Add system information
        "system_uptime": uptime_info,
        "system_uptime_text": uptime_info['text'],
        "system_stats": system_stats,
        # Add line chart data
        "project_monthly_stats": json.dumps(chart_data.get_project_monthly_stats()),
        "task_monthly_stats": json.dumps(chart_data.get_task_monthly_stats()),
        # Add additional chart data
        "project_distribution": json.dumps(chart_data.get_project_distribution()),
        "task_completion_rate": json.dumps(chart_data.get_task_completion_rate()),
        "user_activity": json.dumps(chart_data.get_user_activity()),
        "file_upload_trend": json.dumps(chart_data.get_file_upload_trend()),
    }
    
    # Get chart data with error handling
    try:
        project_monthly_stats = chart_data.get_project_monthly_stats()
    except Exception as e:
        logger.error(f"Error generating project monthly stats: {str(e)}")
        project_monthly_stats = {"labels": [], "datasets": []}
    
    try:
        task_monthly_stats = chart_data.get_task_monthly_stats()
    except Exception as e:
        logger.error(f"Error generating task monthly stats: {str(e)}")
        task_monthly_stats = {"labels": [], "datasets": []}
    
    try:
        active_users_stats = chart_data.get_active_users_stats()
    except Exception as e:
        logger.error(f"Error generating active users stats: {str(e)}")
        active_users_stats = {"labels": [], "datasets": []}
    
    try:
        file_upload_trend = chart_data.get_file_upload_trend()
    except Exception as e:
        logger.error(f"Error generating file upload trend: {str(e)}")
        file_upload_trend = {"type": "line", "data": {"labels": [], "datasets": []}, "summary": {"total_files": 0, "total_size_mb": 0, "months_with_uploads": 0}}
    
    context = {
        "total_user": User.objects.count(),
        "total_active": User.objects.filter(is_active=True).count(),
        "total_inactive": User.objects.filter(is_active=False).count(),
        "total_superuser": User.objects.filter(is_superuser=True).count(),
        "total_project": Project.objects.count(),
        "total_task": Task.objects.count(),
        "total_file": File.objects.count(),
        "total_file_size": hum_convert.main(sum(file.file_size for file in File.objects.all())),
        "pi_chart_data": pi_chart_data,
        # Adding the project and task status counts directly to context as well
        "project_completed": project_completed,
        "project_overdue": project_overdue,
        "project_not_started": project_not_started,
        "project_in_progress": project_in_progress,
        "project_completed_percent": project_completed_percent,
        "project_overdue_percent": project_overdue_percent,
        "project_not_started_percent": project_not_started_percent,
        "project_in_progress_percent": project_in_progress_percent,
        "task_completed": task_completed,
        "task_overdue": task_overdue,
        "task_not_started": task_not_started,
        "task_in_progress": task_in_progress,
        "task_completed_percent": task_completed_percent,
        "task_overdue_percent": task_overdue_percent,
        "task_not_started_percent": task_not_started_percent,
        "task_in_progress_percent": task_in_progress_percent,
        "total_messages": total_messages,
        # Add system information
        "system_uptime": uptime_info,
        "system_uptime_text": uptime_info['text'],
        "system_stats": system_stats,
        # Add chart data
        "project_monthly_stats": json.dumps(project_monthly_stats),
        "task_monthly_stats": json.dumps(task_monthly_stats),
        "active_users_stats": json.dumps(active_users_stats),
        "file_upload_trend": json.dumps(file_upload_trend),
    }
    return render(request, "backstage.html", context)