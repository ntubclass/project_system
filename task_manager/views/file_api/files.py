from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from task_manager.models.file import File
from task_manager.utils import hum_convert
from task_manager.utils import get_file_icon

@login_required(login_url="login")
def main(request, project_id):
    # 取得搜尋參數
    search_query = request.GET.get('search', '').strip()
    
    context = {
        "project_id": project_id,
        "file_data": [],
    }

    files = File.objects.filter(project_id=project_id)
    
    # 如果有搜尋關鍵字，進行後端搜尋
    if search_query:
        files = files.filter(
            Q(file_name__icontains=search_query) |
            Q(file_type__icontains=search_query) |
            Q(user_id__username__icontains=search_query) |
            Q(user_id__first_name__icontains=search_query) |
            Q(user_id__last_name__icontains=search_query)
        )
    
    for m in files:
        data = {}
        for field in m._meta.fields:
            field_name = field.name
            field_value = getattr(m, field_name)
            data[field_name] = field_value
            if field_name == "create_time":
                field_value = field_value.strftime("%Y/%m/%d %H:%M:%S")
            elif field_name == "file_size":
                field_value = hum_convert.main(field_value)
            elif field_name == "file_type":
                field_value = field_value.split("/")[1]
            data[field_name] = field_value
        
        # 處理用戶名稱顯示
        if hasattr(m.user_id, 'first_name') and m.user_id.first_name:
            data["user_id"] = f"{m.user_id.first_name} {m.user_id.last_name or ''}".strip()
        else:
            data["user_id"] = m.user_id.username
            
        file_info = get_file_icon.main(m.file_name)
        data["class_icon"] = file_info['icon']
        data["class_bgClass"] = file_info['bgClass']   
        context["file_data"].append(data)

    return render(request, 'files.html', context)
