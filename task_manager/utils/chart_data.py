from datetime import datetime, timedelta
from django.db.models import Count
from django.db.models.functions import TruncMonth
from task_manager.models.project import Project
from task_manager.models.task import Task

def get_project_monthly_stats(months=6):
    """
    Get project statistics by month for the last N months
    Returns data formatted for Chart.js
    """
    today = datetime.today()
    months_data = []
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
            
        # Get projects for this month
        month_projects = Project.objects.filter(start_date__gte=first_day, start_date__lte=last_day)
        
        # Count projects by status
        completed = 0
        overdue = 0
        not_started = 0
        in_progress = 0
        
        for project in month_projects:
            # Get tasks for this project
            project_tasks = Task.objects.filter(project_id=project.project_id)
            total_progress = sum(int(task.progress) for task in project_tasks) if project_tasks else 0
            total_tasks = project_tasks.count()
            project_progress = int(total_progress / total_tasks) if total_tasks > 0 else 0
            
            # Determine status
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

def get_task_monthly_stats(months=6):
    """
    Get task statistics by month for the last N months
    Returns data formatted for Chart.js
    """
    # Similar implementation to projects but for tasks
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
            
        month_tasks = Task.objects.filter(start_date__gte=first_day, start_date__lte=last_day)
        
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

def get_project_distribution():
    """
    Get project distribution data by project owner/creator
    Returns data formatted for Chart.js bar chart
    """
    from django.contrib.auth.models import User
    from django.db.models import Count
    from task_manager.models.project import Project
    
    # Get top 10 users with most created projects
    users_with_projects = Project.objects.values('user_id').annotate(
        project_count=Count('project_id')
    ).order_by('-project_count')[:10]
    
    # Get usernames for these users
    labels = []
    data = []
    background_colors = []
    
    for item in users_with_projects:
        try:
            user = User.objects.get(id=item['user_id'])
            labels.append(user.username)
            data.append(item['project_count'])
            # Generate a random color based on the username hash
            import hashlib
            hash_object = hashlib.md5(user.username.encode())
            hex_dig = hash_object.hexdigest()
            color = f"rgba({int(hex_dig[:2], 16)}, {int(hex_dig[2:4], 16)}, {int(hex_dig[4:6], 16)}, 0.8)"
            background_colors.append(color)
        except User.DoesNotExist:
            continue
    
    return {
        'type': 'bar',
        'data': {
            'labels': labels,
            'datasets': [{
                'label': '專案數量',
                'data': data,
                'backgroundColor': background_colors,
                'borderColor': 'rgba(200, 200, 200, 1)',
                'borderWidth': 1
            }]
        },
        'options': {
            'scales': {
                'y': {
                    'beginAtZero': True,
                    'title': {
                        'display': True,
                        'text': '專案數量'
                    }
                },
                'x': {
                    'title': {
                        'display': True,
                        'text': '用戶名稱'
                    }
                }
            }
        }
    }

def get_task_completion_rate():
    """
    Get task completion rate data by project
    Returns data formatted for Chart.js horizontal bar chart
    """
    from task_manager.models.project import Project
    from task_manager.models.task import Task
    
    # Get top 10 projects by task completion rate
    projects = Project.objects.all()[:10]  # Limit to 10 projects for better visualization
    
    labels = []
    completed_data = []
    total_data = []
    
    for project in projects:
        labels.append(project.name[:20] + ('...' if len(project.name) > 20 else ''))
        
        project_tasks = Task.objects.filter(project_id=project.project_id)
        total_tasks = project_tasks.count()
        completed_tasks = project_tasks.filter(progress=100).count()
        
        completed_data.append(completed_tasks)
        total_data.append(total_tasks)
    
    return {
        'type': 'bar',
        'data': {
            'labels': labels,
            'datasets': [
                {
                    'label': '已完成任務',
                    'data': completed_data,
                    'backgroundColor': 'rgba(76, 175, 80, 0.7)',
                    'borderColor': 'rgba(76, 175, 80, 1)',
                    'borderWidth': 1
                },
                {
                    'label': '總任務數',
                    'data': total_data,
                    'backgroundColor': 'rgba(33, 150, 243, 0.3)',
                    'borderColor': 'rgba(33, 150, 243, 1)',
                    'borderWidth': 1
                }
            ]
        },
        'options': {
            'indexAxis': 'y',
            'scales': {
                'x': {
                    'beginAtZero': True,
                    'title': {
                        'display': True,
                        'text': '任務數量'
                    }
                },
                'y': {
                    'title': {
                        'display': True,
                        'text': '專案名稱'
                    }
                }
            }
        }
    }

def get_active_users_stats(months=6):
    """
    Get active users statistics over the past few months
    Returns data formatted for Chart.js line chart, consistent with project trends
    """
    from django.contrib.auth.models import User
    from task_manager.models.task import Task
    from django.db.models import Count
    from datetime import datetime, timedelta
    
    # Get active users for the past 6 months (consistent with project chart)
    today = datetime.today()
    labels = []
    active_users = []
    new_users = []  # Change variable name to reflect content
    
    # Get stats for each month (match project trend format)
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
        
        # Format month label
        month_name = first_day.strftime("%m月")
        labels.append(month_name)
        
        # Count new users registered this month
        new_users_count = User.objects.filter(
            date_joined__gte=first_day,
            date_joined__lte=last_day
        ).count()
        new_users.append(new_users_count)
        
        # Count active users this month (users who created tasks)
        users_with_tasks = Task.objects.filter(
            start_date__gte=first_day, 
            start_date__lte=last_day
        ).values('user_id').distinct().count()
        active_users.append(users_with_tasks)
    
    # Format data
    return {
        'labels': labels,
        'datasets': [
            {
                'label': '活躍用戶數',
                'data': active_users,
                'borderColor': 'rgba(54, 162, 235, 1)',
                'backgroundColor': 'rgba(54, 162, 235, 0.2)',
                'tension': 0.4,
                'fill': True
            },
            {
                'label': '新增用戶數',
                'data': new_users,  # Now truly shows new users
                'borderColor': 'rgba(255, 99, 132, 1)', 
                'backgroundColor': 'rgba(255, 99, 132, 0.2)',
                'tension': 0.4,
                'fill': True
            }
        ]
    }

def get_user_activity():
    """
    Get limited user activity data (deprecated)
    Returns a simplified version to avoid chart clutter
    """
    return get_active_users_stats()

def get_file_upload_trend():
    """
    Get file upload trend data by month
    Returns data formatted for Chart.js with bar and line mixed chart types
    """
    from task_manager.models.file import File
    from datetime import datetime, timedelta
    from django.db.models import Count, Sum
    from django.db.models.functions import TruncMonth
    
    # Use 6 months instead of 12 months as requested
    end_date = datetime.today()
    start_date = end_date - timedelta(days=180)  # Last 6 months
    
    # Use Django's built-in aggregation for better performance
    file_stats = File.objects.filter(
        create_time__range=(start_date, end_date)
    ).annotate(
        month=TruncMonth('create_time')
    ).values('month').annotate(
        count=Count('file_id'),
        total_size=Sum('file_size')
    ).order_by('month')
    
    # Prepare data for chart
    labels = []
    count_data = []
    size_data = []
    
    # Ensure all months are represented (even with zero values)
    current_date = start_date.replace(day=1)
    end_month = end_date.replace(day=1)
    
    month_data = {item['month'].strftime('%Y-%m'): item for item in file_stats}
    
    while current_date <= end_month:
        month_key = current_date.strftime('%Y-%m')
        # Just display month without year as requested
        month_label = current_date.strftime("%m月")
        labels.append(month_label)
        
        if month_key in month_data:
            item = month_data[month_key]
            count_data.append(item['count'])
            # Convert to MB and round to 2 decimal places
            size_data.append(round(item['total_size'] / (1024 * 1024), 2))
        else:
            count_data.append(0)
            size_data.append(0)
        
        # Move to next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
    
    # Calculate average file size per month (when files exist)
    avg_size_data = []
    for i in range(len(count_data)):
        if count_data[i] > 0:
            avg_size_data.append(round(size_data[i] / count_data[i], 2))
        else:
            avg_size_data.append(0)
    
    # Calculate totals for the summary
    total_files = sum(count_data)
    total_size_mb = round(sum(size_data), 2)
    avg_file_size = round(total_size_mb / total_files, 2) if total_files > 0 else 0
    
    return {
        'type': 'bar',  # Changed to bar as main chart type
        'data': {
            'labels': labels,
            'datasets': [
                {
                    'type': 'bar',  # Explicit type for bar chart
                    'label': '檔案數量',
                    'data': count_data,
                    'backgroundColor': 'rgba(75, 192, 192, 0.6)',
                    'borderColor': 'rgba(75, 192, 192, 1)',
                    'borderWidth': 1,
                    'borderRadius': 4,
                    'yAxisID': 'y',
                },
                {
                    'type': 'line',  # Explicit type for line chart
                    'label': '檔案大小 (MB)',
                    'data': size_data,
                    'borderColor': 'rgba(153, 102, 255, 1)',
                    'backgroundColor': 'rgba(153, 102, 255, 0.2)',
                    'yAxisID': 'y1',
                    'tension': 0.4,
                    'fill': False,
                    'pointRadius': 4,
                    'pointBackgroundColor': 'rgba(153, 102, 255, 1)',
                    'pointHoverRadius': 6,
                },
                {
                    'type': 'line',  # Explicit type for line chart
                    'label': '平均檔案大小 (MB)',
                    'data': avg_size_data,
                    'borderColor': 'rgba(255, 159, 64, 1)',
                    'backgroundColor': 'rgba(255, 159, 64, 0.2)',
                    'yAxisID': 'y1',
                    'borderDash': [5, 5],
                    'fill': False,
                    'tension': 0.4,
                    'pointRadius': 3,
                    'pointBackgroundColor': 'rgba(255, 159, 64, 1)',
                }
            ]
        },
        'options': {
            'responsive': True,
            'interaction': {
                'mode': 'index',
                'intersect': False,
            },
            'scales': {
                'y': {
                    'type': 'linear',
                    'display': True,
                    'position': 'left',
                    'title': {
                        'display': True,
                        'text': '檔案數量'
                    },
                    'beginAtZero': True,
                    'grid': {
                        'drawOnChartArea': True,
                        'color': 'rgba(200, 200, 200, 0.2)',
                    }
                },
                'y1': {
                    'type': 'linear',
                    'display': True,
                    'position': 'right',
                    'grid': {
                        'drawOnChartArea': False
                    },
                    'title': {
                        'display': True,
                        'text': '檔案大小 (MB)'
                    },
                    'beginAtZero': True,
                },
            },
            'plugins': {
                'legend': {
                    'position': 'top',
                    'align': 'center',
                    'labels': {
                        'usePointStyle': True,
                        'boxWidth': 6,
                        'boxHeight': 6,
                        'padding': 20
                    }
                },
                'title': {
                    'display': False  # Removed chart title
                },
                'subtitle': {
                    'display': False  # Removed subtitle
                }
            }
        },
        # Still include the summary data for backend usage, but it won't be displayed
        'summary': {
            'total_files': total_files,
            'total_size_mb': total_size_mb,
            'avg_file_size_mb': avg_file_size,
            'months_with_uploads': len([x for x in count_data if x > 0])
        }
    }
