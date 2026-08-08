from collections import defaultdict

from django.db import migrations
from django.utils import timezone


def seed_daily_templates(apps, schema_editor):
    Task = apps.get_model("tasks", "Task")
    DailyTask = apps.get_model("tasks", "DailyTask")

    by_key = defaultdict(list)
    for task in Task.objects.filter(task_type="daily").order_by("created_at"):
        by_key[task.name.casefold()].append(task)

    to_update = []
    for key, occurrences in by_key.items():
        distinct_days = {
            timezone.localtime(t.created_at).date() for t in occurrences
        }
        if len(distinct_days) < 2:
            continue
        template = DailyTask.objects.create(
            name=occurrences[-1].name, is_active=True
        )
        for task in occurrences:
            task.daily_template = template
            to_update.append(task)

    if to_update:
        Task.objects.bulk_update(to_update, ["daily_template"])


def unseed_daily_templates(apps, schema_editor):
    Task = apps.get_model("tasks", "Task")
    Task.objects.filter(daily_template__isnull=False).update(
        daily_template=None
    )
    DailyTask = apps.get_model("tasks", "DailyTask")
    DailyTask.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0002_dailytask_task_daily_template"),
    ]

    operations = [
        migrations.RunPython(seed_daily_templates, unseed_daily_templates),
    ]
