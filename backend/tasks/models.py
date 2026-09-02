from django.db import models


class DailyTask(models.Model):
    DAYS_OF_WEEK = [
        (0, "Lunes"),
        (1, "Martes"),
        (2, "Miércoles"),
        (3, "Jueves"),
        (4, "Viernes"),
        (5, "Sábado"),
        (6, "Domingo"),
    ]

    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    scheduled_start = models.TimeField(null=True, blank=True)
    scheduled_end = models.TimeField(null=True, blank=True)
    scheduled_days = models.CharField(
        max_length=13, blank=True, default=""
    )  # ej: "0,1,2,3,4" (Lun-Vie) o vacio = todos

    def __str__(self):
        return f"DailyTask: {self.name}"

    def days_list(self):
        """Devuelve la lista de días en los que aplicar (0-6). Vacio = todos."""
        if not self.scheduled_days:
            return list(range(7))
        try:
            return [int(d) for d in self.scheduled_days.split(",") if d.strip() != ""]
        except ValueError:
            return list(range(7))


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
    position = models.PositiveIntegerField(default=0)
    daily_template = models.ForeignKey(
        DailyTask,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="occurrences",
    )

    def __str__(self):
        return f"[{self.get_task_type_display()}] {self.name}"
