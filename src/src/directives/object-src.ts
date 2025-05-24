export interface ObjectSrcDirective {
  values: string[];
  self?: boolean;
  none?: boolean;
}

export function objectSrcToCsp(directive: ObjectSrcDirective): string {
  const values = [...directive.values];
  if (directive.self) values.unshift("'self'");
  if (directive.none) values.unshift("'none'");
  return `object-src ${values.join(' ')};`;
}
