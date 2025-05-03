from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView


from task_manager.views import (
    test,
    project,
    task_list,
    login,
    register,
    create_project,
    dynamic_search_member,
    user_profile,
    upload_avatar_api,
    logout,
    chat,
    cloud_files,
)

urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("task/", task_list.main, name="task"),
        path("login/", login.login_view, name="login"),
        path("", RedirectView.as_view(url="/login/")),
        path('test/', test.main, name='test'),
        path('register/', register.register_view, name='register'),
        path('logout/', logout.logout_view, name='logout'),
        path('project/', project.main, name='project'),
        path('create_project/', create_project.main, name='create_project'),
        path('dynamic_search_member/', dynamic_search_member.main, name='dynamic_search_member'),
        path('accounts/', include('allauth.urls')),
		path('user_profile/', user_profile.main, name='user_profile'),
        path('upload_avatar_api/', upload_avatar_api.main, name='upload_avatar_api'),    
        path('chat/<int:id>/', chat.main, name='chat'),
        path('cloud_files/', cloud_files.main, name='cloud_files'),   
    ]
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)
