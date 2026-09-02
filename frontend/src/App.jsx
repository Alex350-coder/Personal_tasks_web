import { useState, useEffect, useCallback } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import History from "./components/History";
import Heatmap from "./components/Heatmap";
import ScheduleTimeline from "./components/ScheduleTimeline";
import DailyProgress from "./components/DailyProgress";
import { CalendarIcon } from "./components/Icons";

const API = "/api/tasks";
const ACTIVITY_API = "/api/activity";

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api(`${API}/`);
      setTasks(data);
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api(`${API}/history/`);
      setHistory(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchHistory();
    api(`${ACTIVITY_API}/heatmap/`)
      .then(setHeatmap)
      .catch(() => {});
  }, [fetchTasks, fetchHistory]);

  const addTask = async (name, taskType, schedule = {}) => {
    const payload = { name, task_type: taskType };
    if (schedule.scheduled_start) payload.scheduled_start = schedule.scheduled_start;
    if (schedule.scheduled_end) payload.scheduled_end = schedule.scheduled_end;
    if (schedule.scheduled_days) payload.scheduled_days = schedule.scheduled_days;
    await api(`${API}/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await fetchTasks();
  };

  const completeTask = async (id) => {
    await api(`${API}/${id}/complete/`, { method: "PATCH" });
    await fetchTasks();
    await fetchHistory();
    await refreshHeatmap();
  };

  const deleteTask = async (id) => {
    await api(`${API}/${id}/`, { method: "DELETE" });
    await fetchTasks();
  };

  const renameTask = async (id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await api(`${API}/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ name: trimmed }),
    });
    await fetchTasks();
  };

  const moveTask = async (id, direction) => {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index === -1) return prev;
      const neighbor = index + (direction === "up" ? -1 : 1);
      if (neighbor < 0 || neighbor >= prev.length) return prev;
      if (prev[neighbor].task_type !== prev[index].task_type) return prev;

      const next = [...prev];
      [next[index], next[neighbor]] = [next[neighbor], next[index]];
      api(`${API}/reorder/`, {
        method: "POST",
        body: JSON.stringify({ ids: next.map((t) => t.id) }),
      }).catch(() => {});
      return next;
    });
  };

  const deleteHistoryDay = async (date) => {
    await api(`${API}/history/?date=${date}`, { method: "DELETE" });
    await fetchHistory();
    await refreshHeatmap();
  };

  const refreshHeatmap = async () => {
    try {
      setHeatmap(await api(`${ACTIVITY_API}/heatmap/`));
    } catch {
      /* ignore */
    }
  };

  const pendingCount = tasks.length;
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (error) {
    return (
      <div className="app">
        <header className="header">
          <h1 className="header-title">Mis Tareas</h1>
        </header>
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <p className="header-date">
          <CalendarIcon width={13} height={13} />
          {today}
        </p>
        <h1 className="header-title">Mis Tareas</h1>
        <p className="header-sub">
          {pendingCount === 0
            ? "Todo en orden — sin pendientes."
            : `${pendingCount} ${
                pendingCount === 1 ? "tarea pendiente" : "tareas pendientes"
              }`}
        </p>
      </header>

      <DailyProgress tasks={tasks} history={history} />

      <div className="dashboard-content">
        <div className="dashboard-column dashboard-column--left">
          <ScheduleTimeline tasks={tasks} />
          <TaskForm onAdd={addTask} />
          <Heatmap data={heatmap} />
          <History history={history} onDeleteDay={deleteHistoryDay} />
        </div>
        <div className="dashboard-column dashboard-column--right">
          <TaskList
            types={["daily"]}
            tasks={tasks}
            onComplete={completeTask}
            onDelete={deleteTask}
            onRename={renameTask}
            onMove={moveTask}
          />
          <TaskList
            types={["medium", "long"]}
            tasks={tasks}
            onComplete={completeTask}
            onDelete={deleteTask}
            onRename={renameTask}
            onMove={moveTask}
          />
        </div>
      </div>
    </div>
  );
}
