from django.db import models
from .project import Project


class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="tasks"
    )
    name = models.CharField(max_length=100)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    content = models.TextField()
    progress = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "tasks"
