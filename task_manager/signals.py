from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from task_manager.models.user_info import UserInfo

@receiver(user_logged_in)
def on_user_login(sender, user, request, **kwargs):
    try:
        userinfo = UserInfo.objects.get(user=user)
        userinfo.is_online = True
        userinfo.save(update_fields=["is_online"])
    except UserInfo.DoesNotExist:
        pass

@receiver(user_logged_out)
def on_user_logout(sender, user, request, **kwargs):
    try:
        userinfo = UserInfo.objects.get(user=user)
        userinfo.is_online = False
        userinfo.save(update_fields=["is_online"])
    except UserInfo.DoesNotExist:
        pass
