from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from task_manager.models.user_info import UserInfo
from django.http import HttpResponseNotAllowed

@login_required(login_url="login")
def main(request):
    if request.method == "POST":
        user_info = UserInfo.objects.get(user=request.user)
        user_info.photo = request.FILES.get("avatar_file")
        user_info.save()
        return redirect("/user_profile/")
    else:
        return HttpResponseNotAllowed(['POST'])