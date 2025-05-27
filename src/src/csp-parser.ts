import { Csp } from './csp.js';

export function parseCsp(csp: Csp): string {
  if (!csp) return '';
  const cspStrings: string[] = [];
  for (const [directive, values] of Object.entries(csp)) {
    if (Array.isArray(values) && values.length > 0) {
      cspStrings.push(`${directive} ${values.join(' ')};`);
    }
  }
  return cspStrings.join(' ').trim();
}
