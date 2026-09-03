from datetime import datetime, time

from django.core.management.base import BaseCommand
from django.utils import timezone

from tasks.models import DailyTask, Task


DAILY_TEMPLATES = [
    {
        "name": "Ir al gimnasio",
        "start": time(7, 0),
        "end": time(9, 0),
        "days": "0,1,2,3,4",  # Lun-Vie
    },
    {
        "name": "Bañarme",
        "start": time(9, 0),
        "end": time(9, 20),
        "days": "",
    },
    {
        "name": "Estudiar VHDL",
        "start": time(9, 30),
        "end": time(11, 30),
        "days": "",
    },
    {
        "name": "Aprender palabra + curiosidad",
        "start": time(11, 35),
        "end": time(11, 50),
        "days": "",
    },
    {
        "name": "Planificar/desarrollar juego",
        "start": time(12, 0),
        "end": time(13, 0),
        "days": "0,1,2,3,4,5",  # domingo descansa
    },
    {
        "name": "Lavar ropa",
        "start": time(13, 5),
        "end": time(13, 35),
        "days": "0,1,2,3,4,5",  # domingo descansa
    },
    {
        "name": "Leer un rato",
        "start": time(14, 0),
        "end": time(14, 30),
        "days": "",
    },
    {
        "name": "Estudiar Assembly",
        "start": time(15, 0),
        "end": time(16, 30),
        "days": "",
    },
    {
        "name": "Tocar guitarra",
        "start": time(16, 35),
        "end": time(17, 15),
        "days": "",
    },
    {
        "name": "Practicar dibujo",
        "start": time(17, 20),
        "end": time(17, 50),
        "days": "0,1,2,3,4,5",  # domingo descansa
    },
    {
        "name": "Post de LinkedIn",
        "start": time(18, 0),
        "end": time(18, 20),
        "days": "0,1,2,3,4,5",  # domingo descansa
    },
    {
        "name": "Limpieza de baño",
        "start": time(10, 0),
        "end": time(11, 30),
        "days": "6",  # solo domingo
    },
]

MEDIUM_TERM_TASKS = [
    "Aprender sobre agentes de IA para automatización",
    "Automatizaciones e implementación general",
    "Desarrollar los 3 proyectos web pendientes (Claude Code)",
    "Completar portafolio personal",
]

LONG_TERM_TASKS = [
    "Dominar VHDL (FPGA, RTL, síntesis, verificación, Vivado/Quartus)",
    "Dominar Assembly profesional (ARM Cortex-M, firmware, embebidos, freelance)",
    "Buscar trabajo formal (Dev asistido por IA / seguridad / mixto)",
]


class Command(BaseCommand):
    help = "Siembra las tareas diarias, de medio plazo y largo plazo."

    def handle(self, *args, **options):
        today_weekday = timezone.localdate().weekday()

        # 1) Plantillas diarias
        created_daily = 0
        for spec in DAILY_TEMPLATES:
            template = DailyTask.objects.filter(name=spec["name"]).first()
            if template is None:
                template = DailyTask(
                    name=spec["name"],
                    scheduled_start=spec["start"],
                    scheduled_end=spec["end"],
                    scheduled_days=spec["days"],
                )
                template.save()
                created_daily += 1
            # Si la plantilla ya existe, actualizar la config de horario
            elif (
                template.scheduled_start != spec["start"]
                or template.scheduled_end != spec["end"]
                or template.scheduled_days != spec["days"]
                or not template.is_active
            ):
                template.scheduled_start = spec["start"]
                template.scheduled_end = spec["end"]
                template.scheduled_days = spec["days"]
                template.is_active = True
                template.save()
                self.stdout.write(f"  Actualizada plantilla: {template.name}")

            # Crear la instancia de HOY solo si aplica segun los dias programados
            if today_weekday in template.days_list():
                Task.objects.get_or_create(
                    name=spec["name"],
                    task_type="daily",
                    is_completed=False,
                    daily_template=template,
                )

        # 2) Tareas de medio plazo
        medium = [t for t in Task.objects.filter(task_type="medium")]
        for i, name in enumerate(MEDIUM_TERM_TASKS):
            if not any(t.name == name for t in medium):
                Task.objects.create(
                    name=name,
                    task_type="medium",
                    position=100 + i,
                )
                created_daily += 1

        # 3) Tareas de largo plazo
        long = [t for t in Task.objects.filter(task_type="long")]
        for i, name in enumerate(LONG_TERM_TASKS):
            if not any(t.name == name for t in long):
                Task.objects.create(
                    name=name,
                    task_type="long",
                    position=200 + i,
                )
                created_daily += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed completado: {DailyTask.objects.count()} plantillas diarias, "
                f"{Task.objects.count()} tareas en total."
            )
        )