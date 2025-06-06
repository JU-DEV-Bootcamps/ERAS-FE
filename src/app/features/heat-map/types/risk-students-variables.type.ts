interface Variable {
  variableId: number;
  description: string;
}

interface ComponentVariables {
  variables: Variable[];
}

interface ComponentData {
  cohortId?: number;
  pollUuid?: string;
  componentName: string;
  variables: ComponentVariables;
}
interface MappedData {
  name: string;
  variables: Variable[];
}
interface DialogRiskVariableData {
  pollUUID: string;
  pollName: string;
  data: unknown;
}

export {
  Variable,
  ComponentVariables,
  ComponentData,
  DialogRiskVariableData,
  MappedData,
};
