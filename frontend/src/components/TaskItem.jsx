import { useRef, useState } from "react";

export default function TaskItem({
  task,
  canMoveUp,
  canMoveDown,
  onComplete,
  onDelete,
  onRename,
  onMove,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.name);
  const editingRef = useRef(false);

  const startEdit = () => {
    editingRef.current = true;
    setDraft(task.name);
    setEditing(true);
  };

  const commit = () => {
    if (!editingRef.current) return;
    editingRef.current = false;
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.name) onRename(task.id, trimmed);
  };

  const cancel = () => {
    editingRef.current = false;
    setEditing(false);
    setDraft(task.name);
  };

  return (
    <li className={`task-item type-accent-${task.task_type}`}>
      <button
        className="task-check"
        title="Completar"
        aria-label={`Completar ${task.name}`}
        onClick={() => onComplete(task.id)}
      >
        <span className="task-check-mark">✓</span>
      </button>

      {editing ? (
        <input
          className="task-edit-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
        />
      ) : (
        <span className="task-name">{task.name}</span>
      )}

      <span className="task-actions">
        {!editing && (canMoveUp || canMoveDown) && (
          <span className="task-move">
            <button
              className="btn btn-icon btn-move"
              title="Subir"
              aria-label={`Subir ${task.name}`}
              disabled={!canMoveUp}
              onClick={() => onMove(task.id, "up")}
            >
              ↑
            </button>
            <button
              className="btn btn-icon btn-move"
              title="Bajar"
              aria-label={`Bajar ${task.name}`}
              disabled={!canMoveDown}
              onClick={() => onMove(task.id, "down")}
            >
              ↓
            </button>
          </span>
        )}
        <button
          className="btn btn-icon btn-edit"
          title="Renombrar"
          aria-label={`Renombrar ${task.name}`}
          onClick={editing ? commit : startEdit}
        >
          ✎
        </button>
        <button
          className="btn btn-icon btn-delete"
          title="Eliminar"
          aria-label={`Eliminar ${task.name}`}
          onClick={() => onDelete(task.id)}
        >
          🗑
        </button>
      </span>
    </li>
  );
}
