import { BaseDirective } from './base-directive.js';

export interface ConnectSrcDirective extends BaseDirective {
  ws?: boolean;
  wss?: boolean;
}

export function connectSrcToCsp(directive: ConnectSrcDirective): string {
  const values: string[] = [];
  if (directive.self) values.push("'self'");
  if (directive.data) values.push('data:');
  if (directive.blob) values.push('blob:');
  if (directive.none) values.push("'none'");
  if (directive.ws) values.push('ws:');
  if (directive.wss) values.push('wss:');
  if (directive.customValues) values.push(...directive.customValues);
  if (directive.domains) values.push(...directive.domains);
  return `connect-src ${values.join(' ')};`;
}
