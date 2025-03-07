export interface HealthCheckResponse {
  status: string;
  totalDuration: string;
  entries: {
    cosmicLatteApi: {
      data: {
        date: string;
        ResponseTime: number;
        StatusCode: string;
        ContentLength: number;
      };
      description: string;
      duration: string;
      status: string;
      tags: [];
    };
  };
}
