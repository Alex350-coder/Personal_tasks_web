from django.db import models


class Task(models.Model):
    TASK_TYPES = [
        ("daily", "Diaria"),
        ("medium", "Medio Plazo"),
        ("long", "Largo Plazo"),
    ]

    name = models.CharField(max_length=200)
    task_type = models.CharField(max_length=10, choices=TASK_TYPES)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"[{self.get_task_type_display()}] {self.name}"
