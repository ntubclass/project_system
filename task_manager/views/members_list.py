# members/views.py
from django.shortcuts import render

def main(request, project_id):
    context = {
        "project_id": project_id
    }
    return render(request, 'member_list.html', context)
