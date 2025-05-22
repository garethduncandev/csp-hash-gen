import { Config } from './config.js';
import { Csp } from './csp.js';

export class CspParser {
  public constructor(public readonly config: Config | undefined) {}

  public parseCsp(csp: Csp): string {
    // script-src
    const script = csp.directives['script-src'];
    const scriptSrcCsp =
      script && (script.values.length > 0 || script.hashes.length > 0)
        ? `script-src ${[
            ...script.values,
            ...script.hashes.map((h) => `'${h.hash}'`),
          ].join(' ')};`
        : '';

    // style-src
    const style = csp.directives['style-src'];
    const styleSrcCsp =
      style && (style.values.length > 0 || style.hashes.length > 0)
        ? `style-src ${[
            ...style.values,
            ...style.hashes.map((h) => `'${h.hash}'`),
          ].join(' ')};`
        : '';

    // block-all-mixed-content
    const blockAllMixedContentCsp = csp.directives['block-all-mixed-content']
      ? 'block-all-mixed-content;'
      : '';

    // Each directive as a separate const using a local helper for string[]
    function buildArrayDirectiveCsp(name: keyof Csp['directives']): string {
      const value = csp.directives[name];
      if (Array.isArray(value) && value.length > 0) {
        return `${name} ${value.join(' ')};`;
      }
      return '';
    }

    const baseUriCsp = buildArrayDirectiveCsp('base-uri');
    const childSrcCsp = buildArrayDirectiveCsp('child-src');
    const connectSrcCsp = buildArrayDirectiveCsp('connect-src');
    const defaultSrcCsp = buildArrayDirectiveCsp('default-src');
    const fontSrcCsp = buildArrayDirectiveCsp('font-src');
    const formActionCsp = buildArrayDirectiveCsp('form-action');
    const frameAncestorsCsp = buildArrayDirectiveCsp('frame-ancestors');
    const frameSrcCsp = buildArrayDirectiveCsp('frame-src');
    const imgSrcCsp = buildArrayDirectiveCsp('img-src');
    const manifestSrcCsp = buildArrayDirectiveCsp('manifest-src');
    const mediaSrcCsp = buildArrayDirectiveCsp('media-src');
    const objectSrcCsp = buildArrayDirectiveCsp('object-src');
    const reportUriCsp = buildArrayDirectiveCsp('report-uri');
    const workerSrcCsp = buildArrayDirectiveCsp('worker-src');
    return [
      scriptSrcCsp,
      styleSrcCsp,
      blockAllMixedContentCsp,
      baseUriCsp,
      childSrcCsp,
      connectSrcCsp,
      defaultSrcCsp,
      fontSrcCsp,
      formActionCsp,
      frameAncestorsCsp,
      frameSrcCsp,
      imgSrcCsp,
      manifestSrcCsp,
      mediaSrcCsp,
      objectSrcCsp,
      reportUriCsp,
      workerSrcCsp,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  }
}
