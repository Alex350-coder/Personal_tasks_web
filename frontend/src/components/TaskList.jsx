import TaskItem from "./TaskItem";

const GROUP_LABELS = {
  daily: "Diarias",
  medium: "Medio Plazo",
  long: "Largo Plazo",
};

const GROUP_ORDER = ["daily", "medium", "long"];

export default function TaskList({
  tasks,
  types = GROUP_ORDER,
  onComplete,
  onDelete,
  onRename,
  onMove,
}) {
  const grouped = {};
  for (const type of types) {
    grouped[type] = tasks.filter((t) => t.task_type === type);
  }

  const hasAny = Object.values(grouped).some((g) => g.length > 0);
  if (!hasAny) {
    return <p className="empty-msg">No hay tareas pendientes</p>;
  }

  return (
    <div className="task-groups">
      {types.map(
        (type) =>
          grouped[type].length > 0 && (
            <section key={type} className={`task-group group-${type}`}>
              <h2 className="group-title">
                <span className="group-dot" />
                {GROUP_LABELS[type]}
                <span className="group-count">{grouped[type].length}</span>
              </h2>
              <ul className="task-list">
                {grouped[type].map((task, i) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    canMoveUp={i > 0}
                    canMoveDown={i < grouped[type].length - 1}
                    onComplete={onComplete}
                    onDelete={onDelete}
                    onRename={onRename}
                    onMove={onMove}
                  />
                ))}
              </ul>
            </section>
          )
      )}
    </div>
  );
}
