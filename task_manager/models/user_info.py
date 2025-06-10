from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import random

class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    job = models.CharField(max_length=100,blank=True)
    phone = models.CharField(max_length=20)
    bio = models.TextField(blank=True)
    photo = models.ImageField(blank=True,upload_to='avatars/')
    is_online = models.BooleanField(default=False)  # 新增線上狀態欄位

    def __str__(self):
        return self.user.username

    class Meta:
        db_table = 'user_info'
    
    @receiver(post_save, sender=User)
    def create_or_update_user_profile(sender, instance, created, **kwargs):
        if created:
            # 當新建立 User 時，自動建立對應 Profile
            model_UserProfile = UserInfo()
            model_UserProfile.user = instance
            model_UserProfile.photo = f"avatars/avatar_{random.randint(1,12)}.png"
            model_UserProfile.save()
