export type DirectiveConfig =
  | {
      directive: 'script-src';
      values: Array<
        | "'strict-dynamic'"
        | "'unsafe-inline'"
        | "'unsafe-eval'"
        | "'self'"
        | string
      >;
    }
  | {
      directive: 'style-src';
      values: Array<
        | "'unsafe-inline'"
        | "'unsafe-eval'"
        | "'self'"
        | 'data:'
        | 'blob:'
        | string
      >;
    }
  | {
      directive: 'img-src';
      values: Array<"'self'" | 'data:' | 'blob:' | "'none'" | string>;
    }
  | {
      directive: 'connect-src';
      values: Array<"'self'" | 'ws:' | 'wss:' | "'none'" | string>;
    }
  | {
      directive: 'font-src';
      values: Array<"'self'" | 'data:' | 'blob:' | "'none'" | string>;
    }
  | {
      directive: 'media-src';
      values: Array<"'self'" | 'data:' | 'blob:' | "'none'" | string>;
    }
  | {
      directive: 'frame-src';
      values: Array<"'self'" | 'data:' | 'blob:' | "'none'" | string>;
    }
  | {
      directive: 'worker-src';
      values: Array<"'self'" | 'data:' | 'blob:' | "'none'" | string>;
    }
  | {
      directive: 'child-src';
      values: Array<
        | "'self'"
        | "'unsafe-inline'"
        | "'unsafe-eval'"
        | 'data:'
        | 'blob:'
        | "'none'"
        | string
      >;
    }
  | {
      directive: 'sandbox';
      values: Array<
        | 'allow-forms'
        | 'allow-modals'
        | 'allow-popups'
        | 'allow-same-origin'
        | 'allow-scripts'
        | 'allow-downloads'
        | 'allow-top-navigation'
        | 'allow-top-navigation-by-user-activation'
        | 'allow-presentation'
      >;
    }
  | {
      directive: 'upgrade-insecure-requests';
    }
  | {
      directive: 'block-all-mixed-content';
    }
  | {
      directive: 'require-trusted-types-for';
      values: 'script';
    }
  | {
      directive: 'trusted-types';
      values: Array<'none' | 'allow-duplicates' | { policies: string[] }>;
    }
  | {
      directive: 'report-uri';
      values: string; // A single URL for reporting
    }
  | {
      directive: 'report-to';
      values: Array<string>; // Accepts multiple group names matching the Report-To header
    };

export interface Config {
  /**
   * If true, will create hashes for internal/external local/remote resources for scripts and styles
   */
  calculateHashes: boolean;
  directives: DirectiveConfig[];
}
