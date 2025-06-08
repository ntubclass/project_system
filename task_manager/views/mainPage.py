from django.shortcuts import render
from django.contrib.auth.models import User
from task_manager.models.project import Project
from task_manager.models.task import Task
from task_manager.models.file import File
from task_manager.utils import hum_convert, system_info, chart_data
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from task_manager.models.message import Message
import json
import logging

# Create logger
logger = logging.getLogger(__name__)

@login_required(login_url="login")
def main(request):
    # Get current user
    current_user = request.user
    
    # Get system information
    uptime_info = system_info.get_system_uptime()
    
    # Calculate project status counts for projects the user is involved in
    today = datetime.today().date()
    user_projects = Project.objects.filter(user_id=current_user.id)
    project_completed = 0
    project_overdue = 0
    project_not_started = 0
    project_in_progress = 0
    
    for project in user_projects:
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
    
    # Calculate task status counts for user's tasks
    user_tasks = Task.objects.filter(user_id=current_user.id)
    task_completed = 0
    task_overdue = 0
    task_not_started = 0
    task_in_progress = 0
    
    for task in user_tasks:
        if task.progress == 100:
            task_completed += 1
        elif task.end_date.date() < today and task.progress < 100:
            task_overdue += 1
        elif today < task.start_date.date():
            task_not_started += 1
        else:
            task_in_progress += 1
    
    # Calculate percentages
    total_projects = user_projects.count()
    total_tasks = user_tasks.count()
    
    project_completed_percent = (project_completed / total_projects * 100) if total_projects > 0 else 0
    project_overdue_percent = (project_overdue / total_projects * 100) if total_projects > 0 else 0
    project_not_started_percent = (project_not_started / total_projects * 100) if total_projects > 0 else 0
    project_in_progress_percent = (project_in_progress / total_projects * 100) if total_projects > 0 else 0
    
    task_completed_percent = (task_completed / total_tasks * 100) if total_tasks > 0 else 0
    task_overdue_percent = (task_overdue / total_tasks * 100) if total_tasks > 0 else 0
    task_not_started_percent = (task_not_started / total_tasks * 100) if total_tasks > 0 else 0
    task_in_progress_percent = (task_in_progress / total_tasks * 100) if total_tasks > 0 else 0
    
    # Calculate message totals for user
    total_messages = Message.objects.filter(user_id=current_user.id).count()
    
    # Calculate file totals for user
    user_files = File.objects.filter(user_id=current_user.id)
    total_files = user_files.count()
    total_file_size = sum(file.file_size for file in user_files)
    
    pi_chart_data = {
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
    
    # Get chart data with error handling
    try:
        # Create user-specific project monthly stats
        project_monthly_stats = get_user_project_monthly_stats(current_user.id)
    except Exception as e:
        logger.error(f"Error generating project monthly stats: {str(e)}")
        project_monthly_stats = {"labels": [], "datasets": []}
    
    try:
        # Create user-specific task monthly stats
        task_monthly_stats = get_user_task_monthly_stats(current_user.id)
    except Exception as e:
        logger.error(f"Error generating task monthly stats: {str(e)}")
        task_monthly_stats = {"labels": [], "datasets": []}
    
    context = {
        "username": current_user.username,
        "total_project": total_projects,
        "total_task": total_tasks,
        "total_file": total_files,
        "total_file_size": hum_convert.main(total_file_size),
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
        # Add chart data
        "project_monthly_stats": json.dumps(project_monthly_stats),
        "task_monthly_stats": json.dumps(task_monthly_stats),
    }
    
    return render(request, "mainPage.html", context)

def get_user_project_monthly_stats(user_id, months=6):
    """
    Get project statistics for a specific user by month for the last N months
    Returns data formatted for Chart.js
    """
    today = datetime.today()
    labels = []
    completed_data = []
    in_progress_data = []
    not_started_data = []
    overdue_data = []
    
    # Get stats for each month
    for i in range(months-1, -1, -1):
        # Calculate the first day of each month
        first_day = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        first_day = first_day.replace(month=((today.month - i - 1) % 12) + 1)
        if today.month - i <= 0:
            first_day = first_day.replace(year=today.year - 1)
            
        # Calculate the last day of each month
        if first_day.month == 12:
            last_day = first_day.replace(year=first_day.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            last_day = first_day.replace(month=first_day.month + 1, day=1) - timedelta(days=1)
            
        # Get projects for this month that belong to the user
        month_projects = Project.objects.filter(
            user_id=user_id,
            start_date__gte=first_day, 
            start_date__lte=last_day
        )
        
        # Count projects by status
        completed = 0
        overdue = 0
        not_started = 0
        in_progress = 0
        
        for project in month_projects:
            project_tasks = Task.objects.filter(project_id=project.project_id)
            total_progress = sum(int(task.progress) for task in project_tasks) if project_tasks else 0
            total_tasks = project_tasks.count()
            project_progress = int(total_progress / total_tasks) if total_tasks > 0 else 0
            
            if project_progress == 100:
                completed += 1
            elif project.end_date.date() < today.date() and project_progress < 100:
                overdue += 1
            elif today.date() < project.start_date.date():
                not_started += 1
            else:
                in_progress += 1
        
        # Add data for this month
        month_name = first_day.strftime("%m月")
        labels.append(month_name)
        completed_data.append(completed)
        in_progress_data.append(in_progress)
        not_started_data.append(not_started)
        overdue_data.append(overdue)
    
    return {
        'labels': labels,
        'datasets': [
            {
                'label': '已完成',
                'data': completed_data,
                'borderColor': '#4CAF50',
                'backgroundColor': 'rgba(76, 175, 80, 0.1)',
            },
            {
                'label': '進行中',
                'data': in_progress_data,
                'borderColor': '#2196F3',
                'backgroundColor': 'rgba(33, 150, 243, 0.1)',
            },
            {
                'label': '未開始',
                'data': not_started_data,
                'borderColor': '#9E9E9E',
                'backgroundColor': 'rgba(158, 158, 158, 0.1)',
            },
            {
                'label': '已逾期',
                'data': overdue_data,
                'borderColor': '#F44336',
                'backgroundColor': 'rgba(244, 67, 54, 0.1)',
            }
        ]
    }

def get_user_task_monthly_stats(user_id, months=6):
    """
    Get task statistics for a specific user by month for the last N months
    Returns data formatted for Chart.js
    """
    from datetime import timedelta
    
    today = datetime.today()
    labels = []
    completed_data = []
    in_progress_data = []
    not_started_data = []
    overdue_data = []
    
    for i in range(months-1, -1, -1):
        first_day = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        first_day = first_day.replace(month=((today.month - i - 1) % 12) + 1)
        if today.month - i <= 0:
            first_day = first_day.replace(year=today.year - 1)
            
        if first_day.month == 12:
            last_day = first_day.replace(year=first_day.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            last_day = first_day.replace(month=first_day.month + 1, day=1) - timedelta(days=1)
            
        # Get tasks for this month that belong to the user
        month_tasks = Task.objects.filter(
            user_id=user_id,
            start_date__gte=first_day, 
            start_date__lte=last_day
        )
        
        completed = 0
        overdue = 0
        not_started = 0
        in_progress = 0
        
        for task in month_tasks:
            if task.progress == 100:
                completed += 1
            elif task.end_date.date() < today.date() and task.progress < 100:
                overdue += 1
            elif today.date() < task.start_date.date():
                not_started += 1
            else:
                in_progress += 1
        
        month_name = first_day.strftime("%m月")
        labels.append(month_name)
        completed_data.append(completed)
        in_progress_data.append(in_progress)
        not_started_data.append(not_started)
        overdue_data.append(overdue)
    
    return {
        'labels': labels,
        'datasets': [
            {
                'label': '已完成',
                'data': completed_data,
                'borderColor': '#4CAF50',
                'backgroundColor': 'rgba(76, 175, 80, 0.1)',
            },
            {
                'label': '進行中',
                'data': in_progress_data,
                'borderColor': '#2196F3',
                'backgroundColor': 'rgba(33, 150, 243, 0.1)',
            },
            {
                'label': '未開始',
                'data': not_started_data,
                'borderColor': '#9E9E9E',
                'backgroundColor': 'rgba(158, 158, 158, 0.1)',
            },
            {
                'label': '已逾期',
                'data': overdue_data,
                'borderColor': '#F44336',
                'backgroundColor': 'rgba(244, 67, 54, 0.1)',
            }
        ]
    }
