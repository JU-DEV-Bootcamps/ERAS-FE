interface Variable {
  variableId: number;
  description: string;
}

interface ComponentVariables {
  variables: Variable[];
}

interface ComponentData {
  componentName: string;
  variables: ComponentVariables;
}
interface MappedData {
  name: string;
  variables: Variable[];
}
interface DialogRiskVariableData {
  pollUUID: string;
  data: unknown;
}

export {
  Variable,
  ComponentVariables,
  ComponentData,
  DialogRiskVariableData,
  MappedData,
};
