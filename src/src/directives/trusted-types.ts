export interface TrustedTypesDirective {
  none?: boolean;
  allow_duplicates?: boolean;
  policies?: string[];
  additionalValues?: string[];
}

export function trustedTypesToCsp(directive: TrustedTypesDirective): string {
  const values: string[] = [];
  if (directive.none) values.push("'none'");
  if (directive.allow_duplicates) values.push('allow-duplicates');
  if (directive.policies) values.push(...directive.policies);
  if (directive.additionalValues) values.push(...directive.additionalValues);
  return `trusted-types ${values.join(' ')};`;
}
