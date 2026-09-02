import { useState, useMemo } from "react";
import { TrashIcon, ChevronRightIcon } from "./Icons";

const TYPE_LABELS = { daily: "Diaria", medium: "Medio Plazo", long: "Largo Plazo" };

// Convierte un instante ISO (UTC) a la clave de día local YYYY-MM-DD.
// Usar la fecha local mantiene el agrupado alineado con el endpoint
// "borrar día" del backend, que trabaja con la zona horaria local.
const localDayKey = (iso) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function History({ history, onDeleteDay }) {
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    const map = {};
    for (const t of history) {
      if (!t.completed_at) continue;
      const d = localDayKey(t.completed_at);
      if (!map[d]) map[d] = [];
      map[d].push(t);
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [history]);

  const totalDone = groups.reduce((n, [, items]) => n + items.length, 0);

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="history">
      <button
        className="btn btn-history-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={`history-caret ${open ? "is-open" : ""}`}>
          <ChevronRightIcon width={14} height={14} />
        </span>
        <span>Historial</span>
        <span className="history-count">{totalDone}</span>
      </button>

      {open && (
        <div className="history-body">
          {groups.length === 0 && (
            <p className="empty-msg">Aún no has completado ninguna tarea.</p>
          )}
          {groups.map(([date, items]) => (
            <div key={date} className="history-day">
              <div className="history-day-header">
                <span className="history-date">{formatDate(date)}</span>
                <span className="history-day-count">{items.length}</span>
                <button
                  className="btn btn-icon btn-delete"
                  title="Borrar este día"
                  aria-label={`Borrar historial del ${formatDate(date)}`}
                  onClick={() => onDeleteDay(date)}
                >
                  <TrashIcon width={15} height={15} />
                </button>
              </div>
              <ul className="history-list">
                {items.map((t) => (
                  <li key={t.id} className="history-item">
                    <span className={`history-type-badge type-${t.task_type}`}>
                      {TYPE_LABELS[t.task_type]}
                    </span>
                    <span className="history-name">{t.name}</span>
                    <span className="history-time">
                      {formatTime(t.completed_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
