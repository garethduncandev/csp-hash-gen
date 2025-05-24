import { BaseDirective } from './base-directive.js';

export interface MediaSrcDirective extends BaseDirective {}

export function mediaSrcToCsp(directive: MediaSrcDirective): string {
  const values: string[] = [];
  if (directive.self) values.push("'self'");
  if (directive.data) values.push('data:');
  if (directive.blob) values.push('blob:');
  if (directive.none) values.push("'none'");
  if (directive.customValues) values.push(...directive.customValues);
  if (directive.domains) values.push(...directive.domains);
  return `media-src ${values.join(' ')};`;
}
