from rest_framework import serializers
from .models import DailyTask, Task


class DailyTaskSerializer(serializers.ModelSerializer):
    days = serializers.SerializerMethodField()

    class Meta:
        model = DailyTask
        fields = [
            "id",
            "name",
            "is_active",
            "scheduled_start",
            "scheduled_end",
            "scheduled_days",
            "days",
        ]
        read_only_fields = ["id", "days"]

    def get_days(self, obj):
        return obj.days_list()


class TaskSerializer(serializers.ModelSerializer):
    scheduled_start = serializers.SerializerMethodField()
    scheduled_end = serializers.SerializerMethodField()
    scheduled_days = serializers.SerializerMethodField()
    is_template = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "name",
            "task_type",
            "is_completed",
            "created_at",
            "completed_at",
            "scheduled_start",
            "scheduled_end",
            "scheduled_days",
            "is_template",
        ]
        read_only_fields = [
            "id",
            "is_completed",
            "created_at",
            "completed_at",
            "scheduled_start",
            "scheduled_end",
            "scheduled_days",
            "is_template",
        ]

    def _template(self, obj):
        return getattr(obj, "daily_template", None)

    def get_scheduled_start(self, obj):
        t = self._template(obj)
        return t.scheduled_start.isoformat() if t and t.scheduled_start else None

    def get_scheduled_end(self, obj):
        t = self._template(obj)
        return t.scheduled_end.isoformat() if t and t.scheduled_end else None

    def get_scheduled_days(self, obj):
        t = self._template(obj)
        if not t:
            return None
        return t.days_list()

    def get_is_template(self, obj):
        return obj.task_type == "daily" and obj.daily_template is not None
