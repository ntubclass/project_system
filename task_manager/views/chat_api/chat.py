from django.shortcuts import render, redirect
from django.http import HttpResponse
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember
from task_manager.models.message import Message
from django.contrib import messages
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request, project_id):
    # Check if the project exists
    project_exists = Project.objects.filter(project_id=project_id).exists()
    
    if not project_exists:
        return HttpResponse("Project does not exist", status=404)
    
    # 檢查用戶是否有權限查看此專案（是創建者或成員）
    project = Project.objects.filter(project_id=project_id).first()
    is_member = ProjectMember.objects.filter(project_id=project, user_id=request.user).exists()
    is_creator = (project.user_id == request.user)
    
    if not (is_member or is_creator):
        # 如果不是專案成員或創建者，返回錯誤訊息
        messages.error(request, "您沒有權限查看此專案")
        return redirect('project')
    
    
    # Get chat message history for this project
    messages_history = Message.objects.filter(project_id=project_id).order_by('create_time')
    # Get the pin messages for this project
    pin_message = Message.objects.filter(project_id=project_id, isPin=True)
    has_pin = pin_message.exists()

    if has_pin:
        pin_message = pin_message[0].content
    else:
        pin_message = None


    context = {
        'project_id': project_id,
        'messages_history': messages_history,
        'pin_message': pin_message,
        'has_pin': has_pin,
        'room_id': project_id,
        "is_projectManager": is_projectManager,
    }
    
    return render(request, 'chat_room.html', context)