import { ChildSrcDirective } from './directives/child-src.js';
import { ConnectSrcDirective } from './directives/connect-src.js';
import { DefaultSrcDirective } from './directives/default-src.js';
import { FontSrcDirective } from './directives/font-src.js';
import { FrameSrcDirective } from './directives/frame-src.js';
import { ImgSrcDirective } from './directives/img-src.js';
import { MediaSrcDirective } from './directives/media-src.js';
import { ReportToDirective } from './directives/report-to.js';
import { RequireTrustedTypesForDirective } from './directives/require-trusted-types-for.js';
import { SandboxDirective } from './directives/sandbox.js';
import { ScriptSrcDirective } from './directives/script-src.js';
import { StyleSrcDirective } from './directives/style-src.js';
import { TrustedTypesDirective } from './directives/trusted-types.js';
import { WorkerSrcDirective } from './directives/worker-src.js';

export interface Config {
  directives: {
    'script-src'?: ScriptSrcDirective;
    'style-src'?: StyleSrcDirective;
    'img-src'?: ImgSrcDirective;
    'connect-src'?: ConnectSrcDirective;
    'font-src'?: FontSrcDirective;
    'media-src'?: MediaSrcDirective;
    'frame-src'?: FrameSrcDirective;
    'worker-src'?: WorkerSrcDirective;
    'child-src'?: ChildSrcDirective;
    sandbox?: SandboxDirective;
    'upgrade-insecure-requests'?: boolean;
    'block-all-mixed-content'?: boolean;
    'require-trusted-types-for'?: RequireTrustedTypesForDirective;
    'trusted-types'?: TrustedTypesDirective;
    'report-uri'?: {
      value: string; // A single URL for reporting
    };
    'report-to'?: ReportToDirective;
    'default-src'?: DefaultSrcDirective;
    customDirectives?: {
      [key: string]: string[];
    };
  };
}
