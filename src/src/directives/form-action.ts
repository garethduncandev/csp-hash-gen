export interface FormActionDirective {
  values: string[];
  self?: boolean;
  none?: boolean;
}

export function formActionToCsp(directive: FormActionDirective): string {
  const values = [...directive.values];
  if (directive.self) values.unshift("'self'");
  if (directive.none) values.unshift("'none'");
  return `form-action ${values.join(' ')};`;
}
