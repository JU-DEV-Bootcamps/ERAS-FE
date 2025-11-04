export type DialogType = 'error' | 'success' | 'info' | 'warning';

export interface DialogData {
  title: string;
  type: DialogType;
  message?: string;
  details?: string[];
  action?: {
    label: string;
    action: () => void;
  };
}
