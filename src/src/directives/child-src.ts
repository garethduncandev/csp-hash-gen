import { BaseDirective } from './base-directive.js';

export interface ChildSrcDirective extends BaseDirective {
  'unsafe-inline'?: boolean;
  'unsafe-eval'?: boolean;
}

export function childSrcToCsp(directive: ChildSrcDirective): string {
  const values: string[] = [];
  if (directive.self) values.push("'self'");
  if (directive.data) values.push('data:');
  if (directive.blob) values.push('blob:');
  if (directive.none) values.push("'none'");
  if (directive['unsafe-inline']) values.push("'unsafe-inline'");
  if (directive['unsafe-eval']) values.push("'unsafe-eval'");
  if (directive.customValues) values.push(...directive.customValues);
  if (directive.domains) values.push(...directive.domains);
  return `child-src ${values.join(' ')};`;
}
