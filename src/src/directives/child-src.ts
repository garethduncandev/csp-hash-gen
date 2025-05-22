import { BaseDirective } from './base-directive.js';

export interface ChildSrcDirective extends BaseDirective {
  'unsafe-inline'?: boolean;
  'unsafe-eval'?: boolean;
}
