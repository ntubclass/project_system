# project_system/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from task_manager.views import (
    project
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('project/', project.main, name="project"),
]