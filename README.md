# Mis Tareas — Tareas Simples

Una aplicación web sencilla para organizar el día: tareas **diarias**, de **medio plazo** y de **largo plazo**, con historial diario y un mapa de calor estilo "rachas" al más puro GitHub.

> Proyecto personal y de portafolio. Lo hice para mí, para ordenar mis días, pero si te sirve a ti también, eres bienvenido a usarlo, copiarlo y mejorarlo.

## Características

- **Tres tipos de tareas**: Diarias, Medio Plazo y Largo Plazo, agrupadas en tarjetas con su propio color.
- **Tareas diarias recurrentes**: se registran como plantilla y se regeneran automáticamente cada día.
- **Renombrar tareas**: edición inline con solo un clic (✎).
- **Reordenar por prioridad**: botones ↑/↓ para ordenar las tareas dentro de cada grupo.
- **Historial por día**: registro de tareas completadas, con opción de borrar un día completo.
- **Racha de días**: mapa de calor de ~53 semanas que muestra tu constancia, inspirado en el sistema de contribuciones de GitHub.
- **Diseño cálido y responsive**, en español.

## Stack

- **Backend**: Django + Django REST Framework + SQLite
- **Frontend**: React + Vite

## Cómo ejecutar

### Método 1: automático (recomendado)

En la raíz del proyecto, abre una terminal de PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
```

Inicia backend y frontend al mismo tiempo. Presiona cualquier tecla para detener ambos.

### Método 2: manual (dos terminales)

Terminal 1 — Backend (Django):

```powershell
cd backend
py manage.py migrate
py manage.py runserver 8000
```

Terminal 2 — Frontend (React/Vite):

```powershell
cd frontend
npm install
npx.cmd vite --host
```

### URLs

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/tasks/
- Admin de Django: http://localhost:8000/admin/

## API

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET / POST | `/api/tasks/` | Listar tareas pendientes / crear tarea |
| PATCH | `/api/tasks/<id>/` | Renombrar tarea |
| DELETE | `/api/tasks/<id>/` | Eliminar tarea |
| PATCH | `/api/tasks/<id>/complete/` | Marcar como completada |
| POST | `/api/tasks/reorder/` | Guardar el orden de prioridad (`{"ids": [...]}`) |
| GET / DELETE | `/api/tasks/history/` | Ver historial / borrar un día (`?date=YYYY-MM-DD`) |
| GET | `/api/activity/heatmap/` | Datos del mapa de calor y racha actual |

## Estructura

```
backend/          Django + DRF (app "tasks")
frontend/         React + Vite (componentes en src/components)
iniciar.ps1       Script para levantar ambos servidores
```

## Roadmap

Proyecto en evolución constante. Ideas en mente: modo oscuro, búsqueda, filtros, notas por tarea, exportar historial y más. Si quieres proponer algo, eres bienvenido.
