export default function DailyProgress({ tasks, history }) {
  const todayKey = new Date().toLocaleDateString("en-CA");
  const pendingDaily = tasks.filter((t) => t.task_type === "daily").length;

  const doneToday = history.filter((t) => {
    if (t.task_type !== "daily" || !t.completed_at) return false;
    const d = new Date(t.completed_at);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}` === todayKey;
  }).length;

  const total = pendingDaily + doneToday;
  const pct = total === 0 ? 0 : Math.round((doneToday / total) * 100);

  return (
    <section className="daily-progress">
      <div className="progress-head">
        <span className="progress-label">Progreso de hoy</span>
        <span className="progress-value">
          {doneToday}/{total}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-bar${pct === 100 && total > 0 ? " progress-full" : ""}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={doneToday}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Tareas diarias completadas hoy"
        />
      </div>
    </section>
  );
}