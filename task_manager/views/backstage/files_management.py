from django.shortcuts import render, redirect
from task_manager.models.file import File
from task_manager.utils import hum_convert
from task_manager.utils import get_file_icon
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required(login_url="login")
def main(request):
    if not request.user.is_superuser and not request.user.is_staff:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')
        
    context = {
        "file_data": [],
    }

    files = File.objects.all()
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
        file_info = get_file_icon.main(m.file_name)
        data["class_icon"] = file_info['icon']
        data["class_bgClass"] = file_info['bgClass']   
        context["file_data"].append(data)
    
    return render(request, 'files_management.html', context)