import { BaseDirective } from './base-directive.js';

export interface StyleSrcDirective extends Omit<BaseDirective, 'self'> {
  'unsafe-inline'?: boolean;
  'unsafe-eval'?: boolean;
  autoHash?: boolean;
  self?: boolean | 'auto';
}
