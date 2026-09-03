export const DOW_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const formatTime = (isoTime) =>
  isoTime ? String(isoTime).slice(0, 5) : "";

export const formatTimeRange = (task) => {
  const s = formatTime(task.scheduled_start);
  const e = formatTime(task.scheduled_end);
  if (!s) return "";
  return e ? `${s}–${e}` : s;
};

export const isAppliedToday = (task, todayDow) => {
  if (!task.scheduled_days || task.scheduled_days.length === 0) return true;
  return task.scheduled_days.includes(todayDow);
};

// Agrupa días consecutivos en un rango compacto: [0,1,2,3,4] -> "Lun–Vie"
export const formatDayRange = (days) => {
  if (!days || days.length === 0) return "";
  const sorted = [...days].sort((a, b) => a - b);
  const parts = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    const cur = sorted[i];
    if (i === sorted.length || cur !== prev + 1) {
      parts.push(prev === start ? DOW_SHORT[start] : `${DOW_SHORT[start]}–${DOW_SHORT[prev]}`);
      start = cur;
    }
    prev = cur;
  }
  return parts.join(", ");
};

export const isRestDay = (days) => days && days.length < 7;