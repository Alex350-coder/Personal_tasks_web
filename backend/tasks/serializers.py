from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "name",
            "task_type",
            "is_completed",
            "created_at",
            "completed_at",
        ]
        read_only_fields = ["id", "is_completed", "created_at", "completed_at"]
