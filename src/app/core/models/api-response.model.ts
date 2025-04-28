export interface ApiResponse<T> {
  body: T;
  success: boolean;
  message: string;
  validationErrors: string[] | null;
}
