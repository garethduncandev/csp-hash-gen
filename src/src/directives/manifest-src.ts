export interface ManifestSrcDirective {
  values: string[];
  self?: boolean;
  none?: boolean;
}

export function manifestSrcToCsp(directive: ManifestSrcDirective): string {
  const values = [...directive.values];
  if (directive.self) values.unshift("'self'");
  if (directive.none) values.unshift("'none'");
  return `manifest-src ${values.join(' ')};`;
}
