import { BaseDirective } from './base-directive.js';

export interface StyleSrcDirective extends BaseDirective {
  'unsafe-inline'?: boolean;
  'unsafe-eval'?: boolean;
  self?: boolean;
}

export function styleSrcToCsp(
  directive: StyleSrcDirective,
  hashes: string[] = []
): string {
  const values: string[] = [];
  if (directive.self) values.push("'self'");
  if (directive['unsafe-inline']) values.push("'unsafe-inline'");
  if (directive['unsafe-eval']) values.push("'unsafe-eval'");
  if (directive.customValues) values.push(...directive.customValues);
  if (directive.domains) values.push(...directive.domains);
  if (hashes && hashes.length > 0) values.push(...hashes.map((h) => `'${h}'`));
  return `style-src ${values.join(' ')};`;
}
