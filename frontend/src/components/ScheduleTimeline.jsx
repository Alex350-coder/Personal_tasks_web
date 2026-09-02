import { ClockIcon } from "./Icons";
import {
  formatTime,
  formatDayRange,
  isAppliedToday,
  isRestDay,
} from "../utils/schedule";

const ACCENT = { daily: "var(--daily)", medium: "var(--medium)", long: "var(--long)" };

export default function ScheduleTimeline({ tasks }) {
  const todayDow = new Date().getDay();
  const dailies = tasks.filter((t) => t.task_type === "daily");
  const applied = dailies.filter((t) => isAppliedToday(t, todayDow));
  const withTime = applied
    .filter((t) => t.scheduled_start)
    .sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
  const flexible = applied.filter((t) => !t.scheduled_start);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const isNowOrFuture = (timeStr) => {
    if (!timeStr) return false;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m >= nowMinutes;
  };

  return (
    <section className="schedule">
      <div className="schedule-head">
        <ClockIcon width={18} height={18} />
        <h2 className="schedule-title">Horario de hoy</h2>
        {dailies.some((t) => isRestDay(t.scheduled_days)) && (
          <span className="schedule-right" title="Tareas que descansan ciertos días">
            <small>días especiales</small>
          </span>
        )}
      </div>

      <div className="schedule-body">
        {withTime.map((task) => {
          const upcoming = isNowOrFuture(task.scheduled_start);
          return (
            <div
              className="schedule-row"
              key={task.id}
              style={{ opacity: upcoming ? 1 : 0.72 }}
            >
              <span className="schedule-time">{formatTime(task.scheduled_start)}</span>
              <span className="schedule-name">
                <span
                  className="schedule-dot"
                  style={{ "--accent": ACCENT[task.task_type] }}
                />
                {task.name}
                {isRestDay(task.scheduled_days) && (
                  <span className="days-badge">{formatDayRange(task.scheduled_days)}</span>
                )}
              </span>
            </div>
          );
        })}

        {flexible.length > 0 && (
          <div className="schedule-flexible">
            <div className="schedule-flexible-label">Sin hora fija</div>
            <ul className="schedule-flexible-list">
              {flexible.map((task) => (
                <li key={task.id}>
                  <span
                    className="schedule-dot"
                    style={{ "--accent": ACCENT[task.task_type] }}
                  />
                  {task.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {applied.length === 0 && (
          <p className="empty-msg" style={{ marginBottom: 0 }}>
            Sin tareas diarias para hoy.
          </p>
        )}
      </div>
    </section>
  );
}