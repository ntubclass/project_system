from django.shortcuts import render

def main(request, project_id):
    # 模擬 7 位成員，其中第一位是專案擁有者
    members = [
        {"name": "李", "email": "3434@gmail.com", "role": "專案擁有者"},
    ] + [
        {"name": "魏", "email": "2222@gmail.com", "role": "專案成員"}
    ] + [
        {"name": "林", "email": "9999@gmail.com", "role": "專案成員"},
    ] + [
        {"name": "潘", "email": "1919@gmail.com", "role": "專案成員"},
    ] + [
        {"name": "連", "email": "2323@gmail.com", "role": "專案成員"},
    ] + [
        {"name": "ABC", "email": "888@gmail.com", "role": "專案成員"},
    ] 

    context = {
        "project_id": project_id,
        "members": members,
    }
    return render(request, 'member_list.html', context)
