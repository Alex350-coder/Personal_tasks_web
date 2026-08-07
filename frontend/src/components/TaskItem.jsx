export default function TaskItem({ task, onComplete, onDelete }) {
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
      <span className="task-name">{task.name}</span>
      <button
        className="btn btn-icon btn-delete"
        title="Eliminar"
        aria-label={`Eliminar ${task.name}`}
        onClick={() => onDelete(task.id)}
      >
        🗑
      </button>
    </li>
  );
}
