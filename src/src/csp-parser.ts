import { Config } from './config.js';
import { Csp } from './csp.js';
import { scriptSrcToCsp } from './directives/script-src.js';
import { styleSrcToCsp } from './directives/style-src.js';
import { imgSrcToCsp } from './directives/img-src.js';
import { connectSrcToCsp } from './directives/connect-src.js';
import { fontSrcToCsp } from './directives/font-src.js';
import { mediaSrcToCsp } from './directives/media-src.js';
import { frameSrcToCsp } from './directives/frame-src.js';
import { workerSrcToCsp } from './directives/worker-src.js';
import { childSrcToCsp } from './directives/child-src.js';
import { sandboxToCsp } from './directives/sandbox.js';
import { upgradeInsecureRequestsToCsp } from './directives/upgrade-insecure-requests.js';
import { requireTrustedTypesForToCsp } from './directives/require-trusted-types-for.js';
import { trustedTypesToCsp } from './directives/trusted-types.js';
import { reportUriToCsp } from './directives/report-uri.js';
import { reportToToCsp } from './directives/report-to.js';
import { defaultSrcToCsp } from './directives/default-src.js';

export class CspParser {
  public constructor(public readonly config: Config | undefined) {}

  public parseCsp(csp: Csp): string {
    const cspStrings: string[] = [];

    // script-src
    if (this.config?.directives['script-src']) {
      const hashes =
        csp.directives['script-src']?.hashes?.map((h) => h.hash) || [];
      cspStrings.push(
        scriptSrcToCsp(this.config.directives['script-src'], hashes)
      );
    }
    // style-src
    if (this.config?.directives['style-src']) {
      const hashes =
        csp.directives['style-src']?.hashes?.map((h) => h.hash) || [];
      cspStrings.push(
        styleSrcToCsp(this.config.directives['style-src'], hashes)
      );
    }
    // img-src
    if (this.config?.directives['img-src']) {
      cspStrings.push(imgSrcToCsp(this.config.directives['img-src']));
    }
    // connect-src
    if (this.config?.directives['connect-src']) {
      cspStrings.push(connectSrcToCsp(this.config.directives['connect-src']));
    }
    // font-src
    if (this.config?.directives['font-src']) {
      cspStrings.push(fontSrcToCsp(this.config.directives['font-src']));
    }
    // media-src
    if (this.config?.directives['media-src']) {
      cspStrings.push(mediaSrcToCsp(this.config.directives['media-src']));
    }
    // frame-src
    if (this.config?.directives['frame-src']) {
      cspStrings.push(frameSrcToCsp(this.config.directives['frame-src']));
    }
    // worker-src
    if (this.config?.directives['worker-src']) {
      cspStrings.push(workerSrcToCsp(this.config.directives['worker-src']));
    }
    // child-src
    if (this.config?.directives['child-src']) {
      cspStrings.push(childSrcToCsp(this.config.directives['child-src']));
    }
    // sandbox
    if (this.config?.directives['sandbox']) {
      cspStrings.push(sandboxToCsp(this.config.directives['sandbox']));
    }
    // upgrade-insecure-requests
    if (this.config?.directives['upgrade-insecure-requests']) {
      cspStrings.push(upgradeInsecureRequestsToCsp({}));
    }
    // require-trusted-types-for
    if (this.config?.directives['require-trusted-types-for']) {
      cspStrings.push(
        requireTrustedTypesForToCsp(
          this.config.directives['require-trusted-types-for']
        )
      );
    }
    // trusted-types
    if (this.config?.directives['trusted-types']) {
      cspStrings.push(
        trustedTypesToCsp(this.config.directives['trusted-types'])
      );
    }
    // report-uri
    if (this.config?.directives['report-uri']) {
      cspStrings.push(reportUriToCsp(this.config.directives['report-uri']));
    }
    // report-to
    if (this.config?.directives['report-to']) {
      cspStrings.push(reportToToCsp(this.config.directives['report-to']));
    }
    // default-src
    if (this.config?.directives['default-src']) {
      cspStrings.push(defaultSrcToCsp(this.config.directives['default-src']));
    }
    // block-all-mixed-content
    if (this.config?.directives['block-all-mixed-content']) {
      cspStrings.push('block-all-mixed-content;');
    }
    // (Optional) Add more as needed

    return cspStrings.filter(Boolean).join(' ').trim();
  }
}
