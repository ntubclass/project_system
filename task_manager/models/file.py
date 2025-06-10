from django.db import models
from django.utils import timezone
from .project import Project
from django.contrib.auth.models import User


class File(models.Model):
    file_id = models.AutoField(primary_key=True)
    file_path = models.TextField()
    file_type = models.CharField(max_length=50)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

    class Meta:
        db_table = 'files'
