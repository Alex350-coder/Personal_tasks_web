import { useState } from "react";

const TYPES = [
  { value: "daily", label: "Diaria" },
  { value: "medium", label: "Medio Plazo" },
  { value: "long", label: "Largo Plazo" },
];

export default function TaskForm({ onAdd }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("daily");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, type);
    setName("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        className="task-input"
        type="text"
        placeholder="Nueva tarea..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <select
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
      <button className="btn btn-primary" type="submit">
        Agregar
      </button>
    </form>
  );
}
