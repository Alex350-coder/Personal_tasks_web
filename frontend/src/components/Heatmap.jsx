import { useMemo } from "react";

const WEEKDAY_LABELS = { 1: "Lun", 3: "Mié", 5: "Vie" };
const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];
const MS_DAY = 24 * 60 * 60 * 1000;

const parseDay = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatCell = (cell) => {
  if (!cell) return null;
  const date = parseDay(cell.date);
  const label = date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const count = cell.count;
  if (count === 0) return `${label}: sin tareas completadas`;
  return `${label}: ${count} ${count === 1 ? "tarea completada" : "tareas completadas"}`;
};

export default function Heatmap({ data }) {
  const { grid, months } = useMemo(() => {
    if (!data || !data.days || data.days.length === 0) {
      return { grid: null, months: [] };
    }

    const first = parseDay(data.days[0].date);
    const byDate = new Map(data.days.map((d) => [d.date, d]));
    const cols = Math.ceil((data.days.length + first.getDay()) / 7);

    const grid = Array.from({ length: cols }, () => Array(7).fill(null));
    for (const cell of data.days) {
      const dt = parseDay(cell.date);
      const diff = Math.round((dt - first) / MS_DAY);
      const col = Math.floor((diff + first.getDay()) / 7);
      grid[col][dt.getDay()] = cell;
    }

    const monthLabels = [];
    let lastMonth = -1;
    for (let c = 0; c < cols; c++) {
      const date = grid[c].find(Boolean)?.date;
      if (!date) continue;
      const month = parseDay(date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push([c, MONTHS[month]]);
        lastMonth = month;
      }
    }

    return { grid, months: monthLabels };
  }, [data]);

  if (!grid) return null;

  return (
    <div className="heatmap-card">
      <div className="heatmap-summary">
        <span className="heatmap-chip">
          <span className="heatmap-flame">🔥</span> Racha: {data.current_streak}{" "}
          {data.current_streak === 1 ? "día" : "días"}
        </span>
        <span className="heatmap-chip">
          Total: {data.total_active_days} días activos
        </span>
      </div>

      <div className="heatmap-scroll">
        <div className="heatmap">
          <div
            className="heatmap-months"
            style={{
              gridTemplateColumns: `var(--heatmap-gutter) repeat(${grid.length}, var(--cell))`,
            }}
          >
            <span className="heatmap-gutter" />
            {months.map(([c, label]) => (
              <span key={c} className="heatmap-month" style={{ gridColumn: c + 2 }}>
                {label}
              </span>
            ))}
          </div>
          <div className="heatmap-body">
            <div className="heatmap-weekdays">
              {[1, 3, 5].map((dow) => (
                <span key={dow} className="heatmap-weekday">
                  {WEEKDAY_LABELS[dow]}
                </span>
              ))}
            </div>
            <div className="heatmap-grid">
              {grid.map((col, c) => (
                <div className="heatmap-col" key={c}>
                  {col.map((cell, dow) => (
                    <span
                      key={dow}
                      className={`heatmap-cell${cell && cell.count > 0 ? ` l${cell.level}` : " l0"}`}
                      title={formatCell(cell)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="heatmap-legend">
            <span className="heatmap-legend-label">Menos</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <span key={l} className={`heatmap-cell l${l}`} />
            ))}
            <span className="heatmap-legend-label">Más</span>
          </div>
        </div>
      </div>
    </div>
  );
}
