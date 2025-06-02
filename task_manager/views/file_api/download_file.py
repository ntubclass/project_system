from django.contrib.auth.decorators import login_required
from django.http import FileResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from task_manager.models.file import File
from task_manager.models.project import Project
from django.conf import settings
import os
from django.http import HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from task_manager.models.project_member import ProjectMember

@login_required(login_url="login")
@require_http_methods(["POST"])
def main(request, project_id):

    if request.method == 'POST':
        file_name = request.POST.get('file_name')
        
        try:
            if not file_name:
                return JsonResponse({'error': '未提供檔案名稱'}, status=400)
            
            # 查找檔案
            file_obj = File.objects.get(file_name=file_name)
            if not request.user.is_superuser:
                project = get_object_or_404(Project, project_id=project_id)

                #檢查使用者是否有權限下載
                is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
                is_creator = (project.user_id == request.user)

            
                if not (is_member or is_creator):
                    return JsonResponse({'error': '你沒有權限下載此檔案'}, status=403)
            else:
                project = get_object_or_404(Project, project_id=file_obj.project_id.project_id)
            
            file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
            
            if not os.path.exists(file_path):
                return JsonResponse({'error': '檔案不存在'}, status=404)
            
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{file_obj.file_name}"'
            return response
            
        except File.DoesNotExist:
            return JsonResponse({'error': '找不到檔案'}, status=404)
    else:
        return HttpResponseNotAllowed(['POST'])