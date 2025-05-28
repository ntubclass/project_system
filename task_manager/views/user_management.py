from django.shortcuts import render

def main(request):
    # 範例靜態資料，可改成從資料庫取
    users = [
        {
            'id': 1,
            'name': '張三',
            'email': 'zhang@example.com',
            'role': '專案管理者',
            'status': 'active',
            'last_active': '2024-02-11 15:30',
            'operations_count': 5,
        },
        {
            'id': 2,
            'name': '李四',
            'email': 'li@example.com',
            'role': '一般使用者',
            'status': 'active',
            'last_active': '2024-02-11 14:20',
            'operations_count': 3,
        },
    ]

    total_users = len(users)
    current_page = 1
    total_pages = 3
    page_range = range(1, total_pages + 1)

    context = {
        'users': users,
        'total_users': total_users,
        'current_page': current_page,
        'total_pages': total_pages,
        'page_range': page_range,
    }

    return render(request, 'user_management.html', context)
