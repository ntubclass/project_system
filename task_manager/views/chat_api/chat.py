from django.shortcuts import render, redirect
from django.http import HttpResponse
from task_manager.models.project import Project
from task_manager.models.project_member import ProjectMember
from task_manager.models.message import Message
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request, project_id):
    # Check if the project exists
    project_exists = Project.objects.filter(project_id=project_id).exists()
    
    if not project_exists:
        return HttpResponse("Project does not exist", status=404)
    
    # Check if the user is either the project manager OR a project member
    is_projectManager = Project.objects.filter(
        project_id=project_id, 
        user_id=request.user.id
    ).exists()
    
    is_member = ProjectMember.objects.filter(
        project_id=project_id, 
        user_id=request.user.id
    ).exists()

    if not is_projectManager and not is_member:
        return HttpResponse("You don't have permission to access this chat room", status=401)
    
    
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