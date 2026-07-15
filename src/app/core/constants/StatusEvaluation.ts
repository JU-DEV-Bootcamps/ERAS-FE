export const STATUS_EVALUATIONS: Record<string, string> = {
  Pending: 'Pending',
  Ready: 'Ready',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Uncompleted: 'Uncompleted',
  default: 'New',
};

export const STATUS_COLORS: Record<string, string> = {
  Pending: '#FFEDD5',
  Ready: '#DBEAFE',
  InProgress: '#FEF9C3',
  Completed: '#DCFCE7',
  Uncompleted: '#FEE2E2',
  default: '#F0EAEA',
};

export const STATUS_LABEL_COLORS: Record<string, string> = {
  Pending: '#9A3412',
  Ready: '#1E40AF',
  InProgress: '#854D0E',
  Completed: '#166534',
  Uncompleted: '#991B1B',
  default: '#63656A',
};

export const TOOLTIP_EVALUATIONS: Record<string, string> = {
  Pending: 'This evaluation has not been imported yet.',
  Ready:
    'This evaluation has not ended yet. The poll may also have been used by other evaluations.',
  InProgress: 'This evaluation has bee imported and it is in progress',
  Completed: 'This evaluation has been imported and completed.',
  Uncompleted:
    'This evaluation was not completed before the deadline. The poll may also have been used by other evaluations.',
  default: 'This evaluation process has not defined status.',
};
