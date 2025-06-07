from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView


from task_manager.views import (
    test,
    dynamic_search_member,
)

from task_manager.views.backstage import backstage, chat_management, files_management, project_management, task_management, user_management
from task_manager.views.chat_api import chat
from task_manager.views.file_api import delete_file, download_file, files, upload_file
from task_manager.views.login_api import login, logout, register, reset_password, verify_code, forgot_password
from task_manager.views.member_api import member_list
from task_manager.views.my_task_api import my_task, get_my_task
from task_manager.views.project_api import create_project, project, edit_project, get_project_data, delete_project, change_project_owner
from task_manager.views.project_detail_api import get_project_task, project_detail
from task_manager.views.project_task_api import project_task
from task_manager.views.task_api import edit_task, create_task, update_task, delete_task
from task_manager.views.user_profile_api import user_profile, upload_avatar_api
from task_manager.views.global_search_api import global_search, search_suggestions


urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("my_task/", my_task.main, name="my_task"),
        path("get_my_task/", get_my_task.main, name="get_my_task"),
        path("login/", login.login_view, name="login"),
        path("", RedirectView.as_view(url="/login/")),
        path('test/', test.main, name='test'),
        path('register/', register.register_view, name='register'),
        path('logout/', logout.logout_view, name='logout'),
        path('project/', project.main, name='project'),
        path('create_project/', create_project.main, name='create_project'),
        path('edit_project/', edit_project.main, name='edit_project'),
        path('delete_project/', delete_project.main, name='delete_project'),
        path('get_project_data/<int:project_id>/', get_project_data.main, name='get_project_data'),
        path('create_task/<int:project_id>/', create_task.main, name='create_task'),
        path('dynamic_search_member/', dynamic_search_member.main, name='dynamic_search_member'),
        path('accounts/', include('allauth.urls')),
		path('user_profile/', user_profile.main, name='user_profile'),  
        path('chat/<int:project_id>/', chat.main, name='chat'),
        path('files/<int:project_id>/', files.main, name='files'),
        path('upload_file/<int:project_id>/', upload_file.main, name='upload_file'),
        path('download_file/<int:project_id>/', download_file.main, name='download_file'),
        path('delete_file/', delete_file.main, name='delete_file'),
        path('upload_avatar_api/', upload_avatar_api.main, name='upload_avatar_api'), 
        path('project_detail/<int:project_id>/', project_detail.main, name='project_detail'),
        path("member_list/<int:project_id>/", member_list.main, name='member_list'),   
        path("edit_task/<int:task_id>/", edit_task.main, name='edit_task'),
        path("update_task/<int:task_id>/", update_task.main, name='update_task'), 
        path("delete_task/<int:task_id>/", delete_task.main, name='delete_task'),   
        path("get_project_task/<int:project_id>/", get_project_task.main, name='get_project_task'),
        path("project_task/<int:project_id>/", project_task.main, name='project_task'),
        path('forgot_password/', forgot_password.forgot_password_view, name='forgot_password'),
        path('verify_code/', verify_code.verify_code_view, name='verify_code'),
        path('resend_code/', verify_code.resend_code_view, name='resend_code'),
        path('reset_password/', reset_password.reset_password_view, name='reset_password'),
        path('backstage/', backstage.main, name='backstage'),   
        path('user_management/', user_management.main, name='user_management'),   
        path('project_management/', project_management.main, name='project_management'),   
        path('chat_management/', chat_management.main, name='chat_management'),   
        path('files_management/', files_management.main, name='files_management'),   
        path('task_management/', task_management.main, name='task_management'),
        path('change_project_owner/', change_project_owner.main, name='change_project_owner'),
        path('global_search/', global_search, name='global_search'),
        path('search_suggestions/', search_suggestions, name='search_suggestions'),
        path('delete_user/', user_management.delete_user, name='delete_user'),
    ]
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)
