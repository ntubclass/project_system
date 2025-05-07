from django.contrib.auth.decorators import login_required
from django.http import HttpResponseNotAllowed
from django.http import JsonResponse
from django.conf import settings
import os,mimetypes
from task_manager.models.file import File
from task_manager.models.project import Project
from django.contrib.auth.models import User


@login_required(login_url="login")
def main(request, project_id):
    if request.method == "POST":
        try:
            uploaded_files = request.FILES.getlist('files')
            
            user = User.objects.get(id=request.user.id)
            project = Project.objects.get(name = "123")

            # 檢查重複檔案
            duplicate_files = []
            for uploaded_file in uploaded_files:
                file_path = os.path.join('uploads', project.name, uploaded_file.name)
                # 檢查資料庫中是否已存在該檔案路徑
                existing_file = File.objects.filter(
                    file_path=file_path,
                    project_id=project
                ).first()
                
                if existing_file:
                    duplicate_files.append({
                        'name': uploaded_file.name,
                        'existing_uploader': existing_file.user_id.username,
                        'existing_date': existing_file.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    })
            
            # 如果有重複檔案，詢問是否覆蓋
            if duplicate_files and not request.POST.get('overwrite', False):
                return JsonResponse({
                    'success': False, 
                    'duplicate': True,
                    'duplicate_files': duplicate_files,
                    'message': '發現重複檔案'
                })

            upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', project.name)
            os.makedirs(upload_dir, exist_ok=True)

            for uploaded_file in uploaded_files:
                file_path = os.path.join('uploads', project.name, uploaded_file.name)
                full_path = os.path.join(settings.MEDIA_ROOT, file_path)

                if request.POST.get('overwrite', False):
                    File.objects.filter(file_path=file_path, project_id=project).delete()

                with open(full_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)
            
                file_type, _ = mimetypes.guess_type(uploaded_file.name)
                if not file_type:
                    file_type = 'application/octet-stream'

                model_file = File(
                    file_name=uploaded_file.name,
                    file_path=file_path,
                    file_type=file_type,
                    user_id=user,
                    file_size=uploaded_file.size,
                    project_id=project,
                )

                model_file.save()

            return JsonResponse({'success': True, 'message': '檔案上傳成功'})
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({'success': False, 'message': f'上傳失敗'})
    else:
        return HttpResponseNotAllowed(['POST'])