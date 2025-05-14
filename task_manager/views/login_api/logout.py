from django.shortcuts import redirect
from django.contrib import auth
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def logout_view(request):
    auth.logout(request)
    return redirect("/login/")