from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from task_manager.views import (
    create_project,
    project,
    dynamic_search_member,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('project/', project.main, name="project"),
    path('create_project/', create_project.main, name="create_project"),
    path('dynamic_search_member/', dynamic_search_member.main, name="dynamic_search_member")
]