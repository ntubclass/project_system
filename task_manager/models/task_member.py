from django.db import models
from .task import Task
from django.contrib.auth.models import User


class TaskMember(models.Model):
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'task_members'
        unique_together = ('task_id', 'user_id')
