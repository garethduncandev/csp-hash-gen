import { BaseDirective } from './base-directive.js';

export interface FrameSrcDirective extends BaseDirective {}

export function frameSrcToCsp(directive: FrameSrcDirective): string {
  const values: string[] = [];
  if (directive.self) values.push("'self'");
  if (directive.data) values.push('data:');
  if (directive.blob) values.push('blob:');
  if (directive.none) values.push("'none'");
  if (directive.customValues) values.push(...directive.customValues);
  if (directive.domains) values.push(...directive.domains);
  return `frame-src ${values.join(' ')};`;
}
