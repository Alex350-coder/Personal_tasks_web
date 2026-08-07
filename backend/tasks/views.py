from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer


@api_view(["GET", "POST"])
def task_list(request):
    if request.method == "GET":
        _auto_complete_stale_dailies()
        tasks = Task.objects.filter(is_completed=False).order_by("created_at")
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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


@api_view(["DELETE"])
def delete_task(request, pk):
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    task.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


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

        deleted, _ = Task.objects.filter(
            is_completed=True, completed_at__gte=start, completed_at__lt=end
        ).delete()
        return Response({"deleted": deleted})


def _auto_complete_stale_dailies():
    today = timezone.localdate()
    stale = Task.objects.filter(
        task_type="daily", is_completed=False, created_at__date__lt=today
    )
    for task in stale:
        task.is_completed = True
        task.completed_at = task.created_at
    Task.objects.bulk_update(stale, ["is_completed", "completed_at"])
