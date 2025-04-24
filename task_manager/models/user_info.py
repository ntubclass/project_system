from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    job = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    bio = models.TextField(blank=True)
    photo = models.URLField(blank=True)

    def __str__(self):
        return self.user.username

    class Meta:
        db_table = 'user_info'
