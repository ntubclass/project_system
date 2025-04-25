from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from task_manager.views import (
    project,
    task_list,
    login,
    register,
    create_project,
    dynamic_search_member,
)

urlpatterns = [
    path('project/', project.main, name="project"),
    path('task/', task_list.main, name="task"),
    path('login/', login.login_view, name="login"),
    path('', RedirectView.as_view(url='/login/'), name="login"),
    path('register/', register.register_view, name='register'),
    path('create_project/', create_project.main, name="create_project"),
    path('dynamic_search_member/', dynamic_search_member.main, name="dynamic_search_member"),
]