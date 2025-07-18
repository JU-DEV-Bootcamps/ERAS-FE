export function isStudentNameValid(name: string): boolean {
  const regexName = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
  console.log(name, regexName.test(name));
  return regexName.test(name);
}

export function isStudentEmailValid(email: string): boolean {
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regexEmail.test(email);
}
