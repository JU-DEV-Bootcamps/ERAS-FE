export interface CreateEvaluationProcess {
  Name: string;
  StartDate: Date;
  EndDate: Date;
  PollName: string; // Poll name
}
export interface ReadEvaluationProcess {
  Id: string;
  Name: string;
  StartDate: Date;
  EndDate: Date;
  PollId: string;
  EvaluationPollId: number;
  PollName: string | null;
  // PollUuid
  // EvaluationPollId ??
}

/*
{
  "Id": 0,
  "Name": "string",
  "StartDate": "2025-03-12T11:04:14.607Z",
  "EndDate": "2025-03-12T11:04:14.607Z",
  "PollUuid": "string", // nuestro backend
  "EvaluationPollId": 0, // nuestro backend, tabla intermedia
  "pollId": 0, // nuestro backend
  "status": "string"

  FALTA EL ID DE COSMIC LATTE
}
*/
