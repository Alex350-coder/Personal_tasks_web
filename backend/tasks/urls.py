from django.urls import path
from . import views

urlpatterns = [
    path("tasks/", views.task_list, name="task-list"),
    path("tasks/reorder/", views.reorder_tasks, name="task-reorder"),
    path("tasks/<int:pk>/complete/", views.complete_task, name="task-complete"),
    path("tasks/<int:pk>/", views.task_detail, name="task-detail"),
    path("tasks/history/", views.task_history, name="task-history"),
    path("activity/heatmap/", views.activity_heatmap, name="activity-heatmap"),
]
