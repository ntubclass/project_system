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
    files,
    upload_file,
    download_file,
    delete_file,
    project_detail,
    forgot_password,
    verify_code,
    reset_password,
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
        path('create_task/<int:project_id>/', create_project.main, name='create_task'),
        path('dynamic_search_member/', dynamic_search_member.main, name='dynamic_search_member'),
        path('accounts/', include('allauth.urls')),
		path('user_profile/', user_profile.main, name='user_profile'),
        path('upload_avatar_api/', upload_avatar_api.main, name='upload_avatar_api'),    
        path('chat/<int:project_id>/', chat.main, name='chat'),
        path('files/<int:project_id>/', files.main, name='files'),
        path('upload_file/<int:project_id>/', upload_file.main, name='upload_file'),
        path('download_file/<int:project_id>/', download_file.main, name='download_file'),
        path('delete_file/<int:project_id>/', delete_file.main, name='delete_file'),
        path('upload_avatar_api/', upload_avatar_api.main, name='upload_avatar_api'), 
        path('project_detail/<int:project_id>/', project_detail.main, name='project_detail'),
        path('forgot-password/', forgot_password.forgot_password_view, name='forgot_password'),
        path('verify-code/', verify_code.verify_code_view, name='verify_code'),
        path('resend-code/', verify_code.resend_code_view, name='resend_code'),
        path('reset-password/', reset_password.reset_password_view, name='reset_password'),   
    ]
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)
