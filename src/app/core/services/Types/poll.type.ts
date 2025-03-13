export interface Poll {
  id: number;
  name: string;
  uuid: string;
  version: string;
  audit: {
    createdBy: string;
    modifiedBy: string;
    createdAt: string;
    modifiedAt: string;
  };
}

export interface PollVariable {
  pollId: number;
  variableId: number;
  variableName: string;
}
