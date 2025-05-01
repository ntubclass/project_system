# task_manager/views/chat.py
from django.shortcuts import render

def main(request):
    return render(request, 'chat.html')  # 假設你的模板是 chat/chat.html
