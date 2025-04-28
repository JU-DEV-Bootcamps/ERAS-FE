export type ActionColumnLabel = 'Update' | 'Delete';

export interface ActionButton {
  label: string;
  type: 'update' | 'remove' | 'none';
}
