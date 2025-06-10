from django.db import models
from django.utils import timezone
from .project import Project
from django.contrib.auth.models import User


class Message(models.Model):
    message_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)
    isPin = models.BooleanField(default=False)

    class Meta:
        db_table = 'messages'
