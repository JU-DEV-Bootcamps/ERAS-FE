export const Components = {
  ACADEMIC: 'academico',
  INDIVIDUAL: 'individual',
  FAMILIAR: 'familiar',
  SOCIO_ECONOMIC: 'socioeconomico',
} as const;

type Component = keyof typeof Components;
export type ComponentValueType = (typeof Components)[Component];

export interface RiskStudentDetailType {
  studentId: number;
  studentName: string;
  riskLevel: number;
  componentName: string;
}
