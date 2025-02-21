interface StudentData {
  uuid: string;
  answer: string;
  name: string;
  riskLevel: number;
}

interface Variable {
  name: string;
  students: Student[];
}

interface ComponentData {
  componentName: string;
  variables: Variable[];
}
