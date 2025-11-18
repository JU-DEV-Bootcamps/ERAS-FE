import { Lookup } from '@core/models/lookup';

export function mapFields<T>(
  fields: T[],
  fieldLabel: keyof T,
  fieldValue: keyof T
): Lookup[] {
  return fields.map(item => ({
    label: String(item[fieldLabel]),
    value: item[fieldValue] as string | number,
  }));
}
