interface StudentData {
  uuid: string;
  answer: string;
  name: string;
  riskLevel: number;
}

interface Variable {
  name: string;
  students: StudentData[];
}

interface ComponentData {
  componentName: string;
  variables: Variable[];
}

export { StudentData, Variable, ComponentData };
