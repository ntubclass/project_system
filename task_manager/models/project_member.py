from django.db import models
from .project import Project
from django.contrib.auth.models import User


class ProjectMember(models.Model):
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'project_members'
        unique_together = ('project_id', 'user_id')
