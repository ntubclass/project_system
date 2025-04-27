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
)

urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("project/", project.main, name="project"),
        path("task/", task_list.main, name="task"),
        path("login/", login.login_view, name="login"),
        path("", RedirectView.as_view(url="/login/"), name="login"),
        path('test/', test.main, name='test'),
        path('register/', register.register_view, name='register'),
        # path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
        path('project/', project.main, name='project'),
        path('create_project/', create_project.main, name='create_project'),
        path('dynamic_search_member/', dynamic_search_member.main, name='dynamic_search_member'),
        path('accounts/', include('allauth.urls')),
    ]
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)
# fmt: on
