import { HashResult } from './hashers/hash-result.js';

export interface Csp {
  directives: {
    'base-uri': string[];
    'block-all-mixed-content': boolean;
    'child-src': string[];
    'connect-src': string[];
    'default-src': string[];
    'font-src': string[];
    'form-action': string[];
    'frame-ancestors': string[];
    'frame-src': string[];
    'img-src': string[];
    'manifest-src': string[];
    'media-src': string[];
    'object-src': string[];
    'report-uri': string[];
    'script-src': {
      values: string[];
      hashes: HashResult[];
    };
    'style-src': {
      values: string[];
      hashes: HashResult[];
    };
    'worker-src': string[];
  };
}
