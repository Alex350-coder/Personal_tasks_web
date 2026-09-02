import { useState } from "react";
import { PlusIcon } from "./Icons";

const TYPES = [
  { value: "daily", label: "Diaria" },
  { value: "medium", label: "Medio Plazo" },
  { value: "long", label: "Largo Plazo" },
];

const DOW = [
  { v: 0, label: "Lun" },
  { v: 1, label: "Mar" },
  { v: 2, label: "Mié" },
  { v: 3, label: "Jue" },
  { v: 4, label: "Vie" },
  { v: 5, label: "Sáb" },
  { v: 6, label: "Dom" },
];

export default function TaskForm({ onAdd }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("daily");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [days, setDays] = useState([]);
  const [allDays, setAllDays] = useState(true);
  const [saved, setSaved] = useState(false);

  const toggleDay = (v) => {
    setDays((prev) =>
      prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const schedule = { scheduled_start: start || null, scheduled_end: end || null };
    if (!allDays) schedule.scheduled_days = days.slice().sort();
    onAdd(trimmed, type, schedule);
    setName("");
    setStart("");
    setEnd("");
    setAllDays(true);
    setDays([]);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row-primary">
        <div className="form-field" style={{ flex: "1 1 60%" }}>
          <label className="form-label" htmlFor="task-name">
            Nueva tarea
          </label>
          <input
            id="task-name"
            className="task-input"
            type="text"
            placeholder="¿Qué quieres hacer?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-field" style={{ flex: "1 1 auto" }}>
          <label className="form-label" htmlFor="task-type">
            Tipo
          </label>
          <select
            id="task-type"
            className="task-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type === "daily" && (
        <>
          <div className="form-time-row">
            <div className="form-time-field">
              <label className="form-label" htmlFor="task-start">
                Hora de inicio (opcional)
              </label>
              <input
                id="task-start"
                className="time-input"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="form-time-field">
              <label className="form-label" htmlFor="task-end">
                Hora de fin (opcional)
              </label>
              <input
                id="task-end"
                className="time-input"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="form-days">
            <span className="form-label">Días de la semana</span>
            <div className="form-days-options">
              <label className={`day-chip${allDays ? " is-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={allDays}
                  onChange={(e) => setAllDays(e.target.checked)}
                />
                Todos
              </label>
              {DOW.map((d) => (
                <label key={d.v} className={`day-chip${!allDays && days.includes(d.v) ? " is-on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={!allDays && days.includes(d.v)}
                    disabled={allDays}
                    onChange={() => toggleDay(d.v)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="form-submit-row">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!name.trim()}
        >
          <PlusIcon width={15} height={15} />
          Agregar
        </button>
        {saved && <span className="form-feedback">Tarea agregada ✓</span>}
      </div>
    </form>
  );
}