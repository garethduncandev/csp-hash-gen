import { BaseDirective } from './base-directive.js';

export interface DefaultSrcDirective {
  none?: boolean;
  self?: boolean;
  domains?: string[];
}

export function defaultSrcToCsp(directive: DefaultSrcDirective): string {
  const values: string[] = [];
  if (directive.none) values.push("'none'");
  if (directive.self) values.push("'self'");
  if ((directive as any).domains) values.push(...(directive as any).domains);
  return `default-src ${values.join(' ')};`;
}
