from django.urls import path
from . import views

urlpatterns = [
    path("tasks/", views.task_list, name="task-list"),
    path("tasks/<int:pk>/complete/", views.complete_task, name="task-complete"),
    path("tasks/<int:pk>/", views.delete_task, name="task-delete"),
    path("tasks/history/", views.task_history, name="task-history"),
]
