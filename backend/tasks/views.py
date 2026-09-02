import bisect
import threading
from collections import defaultdict
from datetime import datetime, time, timedelta

from django.db.models import Max
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import DailyTask, Task
from .serializers import TaskSerializer

_daily_lock = threading.Lock()


@api_view(["GET", "POST"])
def task_list(request):
    if request.method == "GET":
        _auto_complete_stale_dailies()
        _reset_dailies()
        tasks = Task.objects.filter(is_completed=False).order_by("position", "created_at")
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            position = (Task.objects.aggregate(m=Max("position"))["m"] or 0) + 1
            task = serializer.save(position=position)
            if task.task_type == "daily":
                _register_daily_template(
                    task,
                    scheduled_start=request.data.get("scheduled_start"),
                    scheduled_end=request.data.get("scheduled_end"),
                    scheduled_days=request.data.get("scheduled_days"),
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
def complete_task(request, pk):
    try:
        task = Task.objects.get(pk=pk, is_completed=False)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    task.is_completed = True
    task.completed_at = timezone.now()
    task.save()
    serializer = TaskSerializer(task)
    return Response(serializer.data)


@api_view(["PATCH", "DELETE"])
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        _rename_daily_template(task)
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    _stop_template_if_daily(task)
    task.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def reorder_tasks(request):
    ids = request.data.get("ids")
    if not isinstance(ids, list):
        return Response(
            {"ids": "Se espera una lista de ids."}, status=status.HTTP_400_BAD_REQUEST
        )

    pending = set(
        Task.objects.filter(is_completed=False).values_list("id", flat=True)
    )
    for task_id in ids:
        if not isinstance(task_id, int) or task_id not in pending:
            return Response(
                {"ids": "La lista contiene ids no válidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    with _daily_lock:
        for position, task_id in enumerate(ids):
            Task.objects.filter(pk=task_id).update(position=position)

    return Response({"ok": True})


@api_view(["GET", "DELETE"])
def task_history(request):
    if request.method == "GET":
        tasks = Task.objects.filter(is_completed=True).order_by("-completed_at")
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    if request.method == "DELETE":
        date_str = request.query_params.get("date")
        if not date_str:
            date = timezone.localdate() - timedelta(days=1)
        else:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()

        start = timezone.make_aware(
            datetime.combine(date, datetime.min.time())
        )
        end = timezone.make_aware(
            datetime.combine(date + timedelta(days=1), datetime.min.time())
        )

        qs = Task.objects.filter(
            is_completed=True, completed_at__gte=start, completed_at__lt=end
        )
        templates = list(
            qs.filter(daily_template__isnull=False)
            .values_list("daily_template", flat=True)
            .distinct()
        )
        deleted, _ = qs.delete()
        if templates:
            DailyTask.objects.filter(pk__in=templates, is_active=True).update(
                is_active=False
            )
        return Response({"deleted": deleted})


@api_view(["GET"])
def activity_heatmap(request):
    today = timezone.localdate()
    span_days = 53 * 7  # ~53 semanas, como el grafico de contribuciones de GitHub
    start = today - timedelta(days=span_days - 1)

    counts = defaultdict(int)
    completed = Task.objects.filter(is_completed=True).only("completed_at")
    for task in completed:
        if task.completed_at is None:
            continue
        local_day = timezone.localtime(task.completed_at).date()
        counts[local_day] += 1

    nonzero = sorted(counts[d] for d in counts if start <= d <= today)

    def level_for(count):
        if count <= 0 or not nonzero:
            return 0
        pos = bisect.bisect_right(nonzero, count)
        return min(4, (4 * pos + len(nonzero) - 1) // len(nonzero))

    days = []
    d = start
    while d <= today:
        count = counts.get(d, 0)
        days.append({"date": d.isoformat(), "count": count, "level": level_for(count)})
        d += timedelta(days=1)

    current_streak = 0
    d = today
    if d not in counts:
        d = today - timedelta(days=1)
    while d in counts:
        current_streak += 1
        d -= timedelta(days=1)

    return Response(
        {
            "days": days,
            "current_streak": current_streak,
            "total_active_days": len(counts),
        }
    )


def _auto_complete_stale_dailies():
    today = timezone.localdate()
    stale = Task.objects.filter(
        task_type="daily", is_completed=False, created_at__date__lt=today
    )
    for task in stale:
        task.is_completed = True
        task.completed_at = task.created_at
    Task.objects.bulk_update(stale, ["is_completed", "completed_at"])


def _parse_time(value):
    if value is None or value == "":
        return None
    if isinstance(value, time):
        return value
    try:
        return datetime.strptime(str(value), "%H:%M").time()
    except ValueError:
        pass
    try:
        return datetime.strptime(str(value)[:8], "%H:%M:%S").time()
    except ValueError:
        return None


def _register_daily_template(task, scheduled_start=None, scheduled_end=None, scheduled_days=None):
    template = DailyTask.objects.filter(name__iexact=task.name).first()
    if template is None:
        template = DailyTask.objects.create(name=task.name)
    elif not template.is_active:
        template.is_active = True
        template.save(update_fields=["is_active"])

    # Persistir horario/config de dias en la plantilla solo si viene en el request
    changed = False
    start = _parse_time(scheduled_start)
    if start is not None and start != template.scheduled_start:
        template.scheduled_start = start
        changed = True
    end = _parse_time(scheduled_end)
    if end is not None and end != template.scheduled_end:
        template.scheduled_end = end
        changed = True
    if scheduled_days is not None:
        if isinstance(scheduled_days, list):
            days_csv = ",".join(str(d) for d in scheduled_days)
        else:
            days_csv = str(scheduled_days)
        if days_csv != template.scheduled_days:
            template.scheduled_days = days_csv
            changed = True
    if changed:
        template.save()

    task.daily_template = template
    task.save(update_fields=["daily_template"])


def _reset_dailies():
    today = timezone.localdate()
    today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    with _daily_lock:
        for template in DailyTask.objects.filter(is_active=True):
            # Si la plantilla define dias especificos, respetarlos
            if template.days_list() and today.weekday() not in template.days_list():
                continue
            has_today = Task.objects.filter(
                daily_template=template, created_at__gte=today_start
            ).exists()
            if not has_today:
                Task.objects.create(
                    name=template.name,
                    task_type="daily",
                    daily_template=template,
                )


def _stop_template_if_daily(task):
    template = task.daily_template
    if template is not None and template.is_active:
        template.is_active = False
        template.save(update_fields=["is_active"])


def _rename_daily_template(task):
    template = task.daily_template
    if template is not None and template.name != task.name:
        template.name = task.name
        template.save(update_fields=["name"])
