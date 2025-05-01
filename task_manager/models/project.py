from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    description = models.TextField(blank=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    percent = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'projects'
