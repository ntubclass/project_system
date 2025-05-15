from django.contrib.auth.decorators import login_required
from django.http import HttpResponseNotAllowed, JsonResponse
from task_manager.models.project import Project
from task_manager.models.file import File
import os
from django.conf import settings

@login_required(login_url="login")
def main(request):
    if request.method == "POST":
        project_id = request.POST.get('project_id')
        project = Project.objects.get(project_id=project_id)
        file = File.objects.filter(project_id=project)

        #刪除實體檔案
        for file_obj in file:
            file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
            if os.path.exists(file_path):
                os.remove(file_path)
        os.rmdir(f"{settings.MEDIA_ROOT}/uploads/{project.name}")
        
        project.delete()
        return JsonResponse({'success': True})
    return HttpResponseNotAllowed(["POST"])