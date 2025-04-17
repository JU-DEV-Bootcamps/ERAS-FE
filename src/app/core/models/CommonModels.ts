export interface GetQueryResponse<T> {
  body: T;
  message: string;
  success: boolean;
}
