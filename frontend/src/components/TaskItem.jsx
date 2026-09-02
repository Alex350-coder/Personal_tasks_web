import { useRef, useState } from "react";
import {
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
} from "./Icons";
import { formatTimeRange, formatDayRange, isRestDay } from "../utils/schedule";

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

  const time = formatTimeRange(task);
  const daysLabel = isRestDay(task.scheduled_days)
    ? formatDayRange(task.scheduled_days)
    : "";

  return (
    <li className={`task-item type-accent-${task.task_type}`}>
      <button
        className="task-check"
        title="Completar"
        aria-label={`Completar ${task.name}`}
        onClick={() => onComplete(task.id)}
      >
        <span className="task-check-mark">
          <CheckIcon width={13} height={13} />
        </span>
      </button>

      <div className="task-main">
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
          <>
            <span className="task-name">{task.name}</span>
            {(time || daysLabel) && (
              <span className="task-meta">
                {time && (
                  <span className="time-badge">
                    <ClockIcon width={11} height={11} />
                    {time}
                  </span>
                )}
                {daysLabel && (
                  <span className="days-badge rest">{daysLabel}</span>
                )}
              </span>
            )}
          </>
        )}
      </div>

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
              <ChevronUpIcon width={15} height={15} />
            </button>
            <button
              className="btn btn-icon btn-move"
              title="Bajar"
              aria-label={`Bajar ${task.name}`}
              disabled={!canMoveDown}
              onClick={() => onMove(task.id, "down")}
            >
              <ChevronDownIcon width={15} height={15} />
            </button>
          </span>
        )}
        <button
          className="btn btn-icon btn-edit"
          title="Renombrar"
          aria-label={`Renombrar ${task.name}`}
          onClick={editing ? commit : startEdit}
        >
          <PencilIcon width={15} height={15} />
        </button>
        <button
          className="btn btn-icon btn-delete"
          title="Eliminar"
          aria-label={`Eliminar ${task.name}`}
          onClick={() => onDelete(task.id)}
        >
          <TrashIcon width={15} height={15} />
        </button>
      </span>
    </li>
  );
}