from django.shortcuts import render, redirect
from task_manager.models.user_info import UserInfo
from task_manager.models.message import Message
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required(login_url="login")
def main(request):
    if not request.user.is_superuser and not request.user.is_staff:
        messages.error(request, "沒有權限查看此頁面")
        return redirect('project')
        
    if request.method  == 'POST':
        print("Received POST request in chat_management view")
        message_id = request.POST.get('message_id')
        if message_id:
            try:
                message = Message.objects.get(message_id=message_id)
                message.delete()
            except Message.DoesNotExist:
                return render(request, 'chat_management.html', {'error': '訊息不存在或已被刪除'})


    # 取得所有訊息
    messages = Message.objects.all().order_by('-create_time')
    
    # 搜尋功能
    search_query = request.GET.get('search', '')
    if search_query:
        messages = messages.filter(
            Q(content__icontains=search_query) |
            Q(user_id__username__icontains=search_query) |
            Q(user_id__email__icontains=search_query) |
            Q(project_id__name__icontains=search_query)
        )


    messages_data = []
    for message in messages:
        try:
            user_info = UserInfo.objects.get(user=message.user_id)
            avatar_url = user_info.photo.url if user_info.photo else None
        except UserInfo.DoesNotExist:
            avatar_url = None

        messages_data.append({
            'message_id': message.message_id,
            'project_name': message.project_id.name if message.project_id else '無專案',
            'user_name': message.user_id.username,
            'user_email': message.user_id.email,
            'user_avatar': avatar_url,
            'content': message.content,
            'create_time': message.create_time
        })

    # 分頁處理
    paginator = Paginator(messages_data, 10)  # 每頁顯示10條訊息
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'messages_data': page_obj,
        'total_messages': len(messages_data),
        'current_page': page_obj.number,
        'total_pages': paginator.num_pages,
        'page_range': paginator.page_range,
        'search_query': search_query,
    }

    return render(request, 'chat_management.html', context)