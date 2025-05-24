export interface RequireTrustedTypesForDirective {
  values: 'script';
}

export function requireTrustedTypesForToCsp(
  directive: RequireTrustedTypesForDirective
): string {
  return `require-trusted-types-for ${directive.values};`;
}
