from django.db import models
from .task import Task
from django.contrib.auth.models import User


class TaskHistory(models.Model):
    task_history_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    info = models.TextField(null=True, blank=True)
    progress = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "task_history"