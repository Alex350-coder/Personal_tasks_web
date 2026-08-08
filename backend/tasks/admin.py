from django.contrib import admin
from .models import DailyTask, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["name", "task_type", "is_completed", "created_at", "completed_at"]
    list_filter = ["task_type", "is_completed"]


@admin.register(DailyTask)
class DailyTaskAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active"]
