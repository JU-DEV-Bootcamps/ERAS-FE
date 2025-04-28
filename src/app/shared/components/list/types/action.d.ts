export type ActionColumnLabel = 'Update' | 'Delete';

export interface ActionColumn {
  key: ActionColumnLabel;
  label: ActionColumnLabel;
  button: ActionButton;
}
