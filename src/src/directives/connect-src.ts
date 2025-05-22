import { BaseDirective } from './base-directive.js';

export interface ConnectSrcDirective extends BaseDirective {
  ws?: boolean;
  wss?: boolean;
}
