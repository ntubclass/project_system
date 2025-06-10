from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from task_manager.models.file import File
from django.conf import settings
import os
from django.http import HttpResponseNotAllowed

@login_required(login_url="login")
def main(request):
    if request.method == 'POST':
        file_id = request.POST.get('file_id')
        
        if not file_id:
            return JsonResponse({'success': False, 'message': '未提供檔案ID'})
        
        try:
            file_obj = File.objects.get(file_id=file_id)
            
            # 檢查使用者是否有權限刪除
            if file_obj.user_id != request.user:
                return JsonResponse({'success': False, 'message': '你沒有權限刪除此檔案'})
            
            # 刪除實體檔案
            file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # 刪除資料庫記錄
            file_obj.delete()
            
            return JsonResponse({'success': True, 'message': '檔案已成功刪除'})
            
        except File.DoesNotExist:
            return JsonResponse({'success': False, 'message': '找不到檔案'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    else:
        return HttpResponseNotAllowed(['POST'])