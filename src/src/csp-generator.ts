import path from 'path';
import { Csp } from './csp.js';
import { getFilePaths } from './utils/file-utils.js';
import { getHtmlFileHashes } from './utils/hash-utils.js';
import { SHAType } from './sha-type.enum.js';
import { Config } from './config.js';
import { BaseUriDirective } from './directives/base-uri.js';
import { FormActionDirective } from './directives/form-action.js';
import { FrameAncestorsDirective } from './directives/frame-ancestors.js';
import { ManifestSrcDirective } from './directives/manifest-src.js';
import { ObjectSrcDirective } from './directives/object-src.js';

export type CspResponse = {
  combinedCsp: Csp;
  individualCsps: { htmlPath: string; csp: Csp }[];
};

export class CspGenerator {
  public constructor(public readonly config: Config) {}

  public async generateCsp(htmlFilePath: string, sha: SHAType): Promise<Csp> {
    const absoluteDir = path.resolve(path.dirname(htmlFilePath));

    // Get script and style hashes separately
    const scriptHashesArr = await getHtmlFileHashes(
      absoluteDir,
      htmlFilePath,
      sha,
      'script'
    );
    const styleHashesArr = await getHtmlFileHashes(
      absoluteDir,
      htmlFilePath,
      sha,
      'style'
    );

    // Build CSP object for this HTML file using the Csp interface
    const cfg = this.config?.directives || {};
    const csp: Csp = {
      directives: {
        'script-src': {
          values: cfg['script-src']?.customValues || [],
          hashes: scriptHashesArr.map((h) => {
            const location =
              h.resourceLocation === 'local'
                ? 'local'
                : h.resourceLocation === 'remote'
                ? 'remote'
                : 'inline';
            const hashObj: any = { hash: h.hash, location };
            if (location !== 'inline') hashObj.src = h.src;
            return hashObj;
          }),
        },
        'style-src': {
          values: cfg['style-src']?.customValues || [],
          hashes: styleHashesArr.map((h) => {
            const location =
              h.resourceLocation === 'local'
                ? 'local'
                : h.resourceLocation === 'remote'
                ? 'remote'
                : 'inline';
            const hashObj: any = { hash: h.hash, location };
            if (location !== 'inline') hashObj.src = h.src;
            return hashObj;
          }),
        },
        'base-uri': [],
        'block-all-mixed-content': !!cfg['block-all-mixed-content'],
        'child-src': cfg['child-src']?.customValues || [],
        'connect-src': cfg['connect-src']?.customValues || [],
        'default-src': cfg['default-src']?.domains || [],
        'font-src': cfg['font-src']?.customValues || [],
        'form-action': [],
        'frame-ancestors': [],
        'frame-src': cfg['frame-src']?.customValues || [],
        'img-src': cfg['img-src']?.customValues || [],
        'manifest-src': [],
        'media-src': cfg['media-src']?.customValues || [],
        'object-src': [],
        'report-uri': cfg['report-uri'] ? [cfg['report-uri'].value] : [],
        'worker-src': cfg['worker-src']?.customValues || [],
      },
    };

    return csp;
  }

  public mergePolicies(policies: Csp[]): Csp {
    const merged: Csp = {
      directives: {
        'script-src': { values: [], hashes: [] },
        'style-src': { values: [], hashes: [] },
        'block-all-mixed-content': true,
        'base-uri': [],
        'child-src': [],
        'connect-src': [],
        'default-src': [],
        'font-src': [],
        'form-action': [],
        'frame-ancestors': [],
        'frame-src': [],
        'img-src': [],
        'manifest-src': [],
        'media-src': [],
        'object-src': [],
        'report-uri': [],
        'worker-src': [],
      },
    };

    // Merge script-src and style-src
    for (const csp of policies) {
      // script-src
      if (csp.directives['script-src']) {
        for (const v of csp.directives['script-src'].values) {
          if (!merged.directives['script-src'].values.includes(v))
            merged.directives['script-src'].values.push(v);
        }
        for (const h of csp.directives['script-src'].hashes) {
          if (
            !merged.directives['script-src'].hashes.some(
              (x) => x.hash === h.hash
            )
          )
            merged.directives['script-src'].hashes.push(h);
        }
      }
      // style-src
      if (csp.directives['style-src']) {
        for (const v of csp.directives['style-src'].values) {
          if (!merged.directives['style-src'].values.includes(v))
            merged.directives['style-src'].values.push(v);
        }
        for (const h of csp.directives['style-src'].hashes) {
          if (
            !merged.directives['style-src'].hashes.some(
              (x) => x.hash === h.hash
            )
          )
            merged.directives['style-src'].hashes.push(h);
        }
      }
      // block-all-mixed-content: true only if all are true
      if (!csp.directives['block-all-mixed-content']) {
        merged.directives['block-all-mixed-content'] = false;
      }
      // All other string[]
      [
        'base-uri',
        'child-src',
        'connect-src',
        'default-src',
        'font-src',
        'form-action',
        'frame-ancestors',
        'frame-src',
        'img-src',
        'manifest-src',
        'media-src',
        'object-src',
        'report-uri',
        'worker-src',
      ].forEach((dir) => {
        const arr = csp.directives[
          dir as keyof typeof csp.directives
        ] as string[];
        for (const v of arr) {
          if (
            !(
              merged.directives[
                dir as keyof typeof merged.directives
              ] as string[]
            ).includes(v)
          ) {
            (
              merged.directives[
                dir as keyof typeof merged.directives
              ] as string[]
            ).push(v);
          }
        }
      });
    }
    return merged;
  }
}
