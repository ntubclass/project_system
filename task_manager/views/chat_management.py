from django.shortcuts import render
from django.contrib.auth.models import User
from task_manager.models.user_info import UserInfo
from task_manager.models.project_member import ProjectMember
# from task_manager.models.chat_message import ChatMessage
from django.core.paginator import Paginator
from datetime import datetime, timedelta

def main(request):
    # 取得所有訊息
    messages = Message.objects.all().order_by('-create_time')
    
    # 假設的查詢邏輯 - 請根據實際模型調整
    # all_messages = ChatMessage.objects.select_related('user', 'project').order_by('-create_time')
    # 
    # messages = []
    # for message in all_messages:
    #     try:
    #         project_name = message.project.name if message.project else '未指定專案'
    #         user_name = message.user.username if message.user else '未知用戶'
    #         messages.append({
    #             'message_id': message.message_id,
    #             'project_name': project_name,
    #             'user_name': user_name,
    #             'user_email': message.user.email if message.user else '',
    #             'content': message.content,
    #             'create_time': message.create_time,
    #             'user_avatar': message.user.userinfo.photo.url if (message.user and hasattr(message.user, 'userinfo') and message.user.userinfo.photo) else None,
    #         })
    #     except Exception as e:
    #         continue
    
    # 暫時的示例資料，實際使用時請替換為上面的查詢邏輯
    messages_data = [
        {
            'message_id': 1,
            'project_name': '專案管理系統',
            'user_name': 'admin',
            'user_email': 'admin@example.com',
            'content': '專案進度討論，目前已完成需求分析階段',
            'create_time': datetime.now() - timedelta(hours=1),
            'user_avatar': None,
        },
        {
            'message_id': 2,
            'project_name': '網站開發',
            'user_name': 'developer',
            'user_email': 'dev@example.com',
            'content': '前端界面已完成，準備進行後端整合',
            'create_time': datetime.now() - timedelta(hours=2),
            'user_avatar': None,
        },
        {
            'message_id': 3,
            'project_name': '行動應用開發',
            'user_name': 'designer',
            'user_email': 'design@example.com',
            'content': 'UI設計稿已更新，請大家查看',
            'create_time': datetime.now() - timedelta(hours=3),
            'user_avatar': None,
        },
        {
            'message_id': 4,
            'project_name': '專案管理系統',
            'user_name': 'tester',
            'user_email': 'test@example.com',
            'content': '發現一個小bug，已記錄在系統中',
            'create_time': datetime.now() - timedelta(days=1),
            'user_avatar': None,
        },
        {
            'message_id': 5,
            'project_name': '資料分析平台',
            'user_name': 'analyst',
            'user_email': 'analyst@example.com',
            'content': '資料清理作業已完成，可以開始分析',
            'create_time': datetime.now() - timedelta(days=2),
            'user_avatar': None,
        },
    ]

    # 搜尋功能
    search_query = request.GET.get('search', '')
    if search_query:
        filtered_messages = []
        for msg in messages_data:
            if (search_query.lower() in msg['project_name'].lower() or 
                search_query.lower() in msg['user_name'].lower() or 
                search_query.lower() in msg['content'].lower()):
                filtered_messages.append(msg)
        messages_data = filtered_messages

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