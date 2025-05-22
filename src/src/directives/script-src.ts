import { BaseDirective } from './base-directive.js';

export interface ScriptSrcDirective extends Omit<BaseDirective, 'self'> {
  strict_dynamic?: boolean;
  'unsafe-inline'?: boolean;
  'unsafe-eval'?: boolean;
  autoHash?: boolean;
  self?: boolean | 'auto';
}
