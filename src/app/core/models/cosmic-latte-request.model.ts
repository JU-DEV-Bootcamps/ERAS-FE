export interface HealthCheckResponse {
  status: string;
  totalDuration: string;
  entries: {
    cosmicLatteApi: {
      data: {
        date: string;
      };
      duration: string;
      status: string;
      tags: [];
    };
  };
}
