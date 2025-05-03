from django.shortcuts import render

def main(request, id):
    return render(request, 'chat_room.html', {'room_id': id})