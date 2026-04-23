export const STATUS_EVALUATIONS: Record<string, string> = {
  Pending: 'Pending',
  Ready: 'Ready',
  InProgress: 'In Progress',
  Completed: 'Resolved',
  Uncompleted: 'Unresolved',
  default: 'New',
};

export const STATUS_COLORS: Record<string, string> = {
  Pending: '#FFEDD5',
  Ready: '#DBEAFE',
  InProgress: '#FEF9C3',
  Completed: '#DCFCE7',
  Uncompleted: '#FEE2E2',
  default: '#DBEAFE',
};

export const STATUS_LABEL_COLORS: Record<string, string> = {
  Pending: '#9A3412',
  Ready: '#1E40AF',
  InProgress: '#854D0E',
  Completed: '#166534',
  Uncompleted: '#991B1B',
  default: '#1E40AF',
};
