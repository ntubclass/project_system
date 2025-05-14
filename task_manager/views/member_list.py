from django.shortcuts import render

def main(request, project_id):
    # 模擬 7 位成員，其中第一位是專案擁有者
    members = [
        {"name": "張三", "email": "123@gmail.com", "role": "專案擁有者"},
    ] + [
        {"name": "張三", "email": "123@gmail.com", "role": "專案成員"}
        for _ in range(6)
    ]

    context = {
        "project_id": project_id,
        "members": members,
    }
    return render(request, 'member_list.html', context)
