# task_manager/views/chat.py
from django.shortcuts import render

def main(request):
    return render(request, 'chat_room.html')  # 假設你的模板是 chat/chat.html
