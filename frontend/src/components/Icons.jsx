const make = (children, props = {}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const CheckIcon = (p) =>
  make(<path d="M20 6 9 17l-5-5" />, p);

export const PlusIcon = (p) =>
  make(<path d="M12 5v14M5 12h14" />, p);

export const PencilIcon = (p) =>
  make(
    <>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </>,
    p
  );

export const TrashIcon = (p) =>
  make(
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </>,
    p
  );

export const ChevronUpIcon = (p) => make(<path d="m18 15-6-6-6 6" />, p);
export const ChevronDownIcon = (p) => make(<path d="m6 9 6 6 6-6" />, p);

export const ClockIcon = (p) =>
  make(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
    p
  );

export const CalendarIcon = (p) =>
  make(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </>,
    p
  );

export const FlameIcon = (p) =>
  make(
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    p
  );

export const ChevronRightIcon = (p) => make(<path d="m9 18 6-6-6-6" />, p);

export const FocusIcon = (p) =>
  make(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>,
    p
  );