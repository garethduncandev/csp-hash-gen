export interface BaseUriDirective {
  values: string[];
  self?: boolean;
  none?: boolean;
}

export function baseUriToCsp(directive: BaseUriDirective): string {
  const values = [...directive.values];
  if (directive.self) values.unshift("'self'");
  if (directive.none) values.unshift("'none'");
  return `base-uri ${values.join(' ')};`;
}
