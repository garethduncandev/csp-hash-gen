import { BaseDirective } from './base-directive.js';

export interface ScriptSrcDirective extends BaseDirective {
  'strict-dynamic'?: boolean;
  'unsafe-inline'?: boolean;
  'unsafe-eval'?: boolean;
  self?: boolean;
}

export function scriptSrcToCsp(
  directive: ScriptSrcDirective,
  hashes: string[] = []
): string {
  const values: string[] = [];
  if (directive.self) values.push("'self'");
  if (directive['strict-dynamic']) values.push('strict-dynamic');
  if (directive['unsafe-inline']) values.push("'unsafe-inline'");
  if (directive['unsafe-eval']) values.push("'unsafe-eval'");
  if (directive.customValues) values.push(...directive.customValues);
  if (directive.domains) values.push(...directive.domains);
  if (hashes && hashes.length > 0) values.push(...hashes.map((h) => `'${h}'`));
  return `script-src ${values.join(' ')};`;
}
