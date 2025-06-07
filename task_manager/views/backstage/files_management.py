from django.shortcuts import render, redirect
from task_manager.models.file import File
from task_manager.utils import hum_convert
from task_manager.utils import get_file_icon
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.core.paginator import Paginator

@login_required(login_url="login")
def main(request):

    search_query = request.GET.get('search', '').strip()

    if not request.user.is_superuser:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')

    files = File.objects.all()

    if search_query:
        files = files.filter(
            Q(file_name__icontains=search_query) |
            Q(file_type__icontains=search_query) |
            Q(user_id__username__icontains=search_query) |
            Q(user_id__first_name__icontains=search_query) |
            Q(user_id__last_name__icontains=search_query)
        )

    # 按照建立時間倒序排列
    files = files.order_by('-create_time')
    
    # 分頁處理
    paginator = Paginator(files, 10)  # 每頁顯示10個檔案
    page_number = request.GET.get('page', 1)
    
    try:
        page_number = int(page_number)
    except ValueError:
        page_number = 1
        
    page_obj = paginator.get_page(page_number)
    
    # 準備檔案資料
    file_data = []
    for m in page_obj:
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
        file_data.append(data)
    
    # 計算分頁顯示資訊
    start_index = (page_obj.number - 1) * paginator.per_page + 1
    end_index = min(page_obj.number * paginator.per_page, paginator.count)

    context = {
        "file_data": file_data,
        "page_obj": page_obj,
        "total_files": paginator.count,
        "current_page": page_obj.number,
        "total_pages": paginator.num_pages,
        "page_range": paginator.page_range,
        "search_query": search_query,
        "has_previous": page_obj.has_previous(),
        "has_next": page_obj.has_next(),
        "previous_page_number": page_obj.previous_page_number() if page_obj.has_previous() else None,
        "next_page_number": page_obj.next_page_number() if page_obj.has_next() else None,
        "start_index": start_index,
        "end_index": end_index,
    }
    
    return render(request, 'files_management.html', context)