export type AssessmentActivityType =
  | 'Created'
  | 'CommentAdded'
  | 'StatusChanged';

/** One event of the activity history of an assessment; mirrors the BE `AssessmentActivityDto`. */
export interface AssessmentActivityModel {
  id: number;
  type: AssessmentActivityType;
  description: string;
  /** UTC timestamp (ISO 8601). */
  occurredAtUtc: string;
  userName: string;
}
