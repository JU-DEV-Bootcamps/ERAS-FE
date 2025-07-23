export function isFieldNameValid(name: string): boolean {
  const regexName = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
  return regexName.test(name);
}

export function isFieldEmailValid(email: string): boolean {
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regexEmail.test(email);
}
