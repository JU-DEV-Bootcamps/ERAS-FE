export type InterventionActivityType =
  | 'Created'
  | 'CommentAdded'
  | 'StatusChanged';

/** One event of the activity history of an intervention; mirrors the BE `InterventionActivityDto`. */
export interface InterventionActivityModel {
  id: number;
  type: InterventionActivityType;
  description: string;
  /** UTC timestamp (ISO 8601). */
  occurredAtUtc: string;
  userName: string;
}
