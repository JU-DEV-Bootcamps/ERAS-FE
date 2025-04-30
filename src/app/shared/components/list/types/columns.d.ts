export interface Column<T> {
  label: string;
  key: keyof T;
}