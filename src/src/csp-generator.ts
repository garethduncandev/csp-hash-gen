import { Config, DirectiveConfig } from './config.js';
import { HashResult, HtmlHashes } from './hashers/hash-result.js';

export class CspGenerator {
  public constructor(public readonly config: Config | undefined) {}
  public createCombinedCsp(hashes: HtmlHashes[]): string {
    // create combined csp
    const combinedHashes: HashResult[] = hashes.reduce(
      (acc: HashResult[], htmlHashes: HtmlHashes) => {
        return acc.concat(htmlHashes.hashes);
      },
      []
    );

    // remove duplicates
    const uniqueHashes = new Map<string, HashResult>();
    combinedHashes.forEach((hash) => {
      const key = `${hash.resourceType}-${hash.hash}`;
      if (!uniqueHashes.has(key)) {
        uniqueHashes.set(key, hash);
      }
    });
    const combinedHashesArray = Array.from(uniqueHashes.values());

    const csp = this.createHtmlCsp(combinedHashesArray);
    return csp;
  }

  public createHtmlCsp(hashes: HashResult[]): string {
    // script-src

    const scriptSrcSegments = hashes
      .filter((x) => x.resourceType === 'script')
      .map((x) => `'${x.hash}'`);

    // if config, get additional values for script-src
    const scriptSrcConfigValues = this.config?.directives
      .filter((x) => x.directive === 'script-src')
      .flatMap((x) => x.values);

    if (scriptSrcConfigValues && scriptSrcConfigValues.length > 0) {
      scriptSrcSegments.push(...scriptSrcConfigValues);
    }

    let scriptSrc = `script-src ${scriptSrcSegments.join(' ')}`;

    scriptSrc = scriptSrcSegments.length > 0 ? `${scriptSrc};` : '';

    const styleHashes = hashes
      .filter((x) => x.resourceType === 'style')
      .map((x) => `'${x.hash}'`);
    const distinctStyleHashes = [...new Set(styleHashes)];

    const styleDomains = hashes
      .filter(
        (x) =>
          x.resourceType === 'style' && x.domain !== null && x.domain !== 'self'
      )
      .map((x) => `${x.domain}`);

    // add any config style-src values
    const styleSrcConfigValues = this.config?.directives
      .filter((x) => x.directive === 'style-src')
      .flatMap((x) => x.values);
    if (styleSrcConfigValues && styleSrcConfigValues.length > 0) {
      styleDomains.push(...styleSrcConfigValues);
    }

    const distinctStyleDomains = [...new Set(styleDomains)];

    const hasSelf = hashes.some(
      (x) => x.resourceType === 'style' && x.domain === 'self'
    );
    if (hasSelf) {
      distinctStyleDomains.push("'self'");
    }

    const styleSrc =
      distinctStyleDomains.length > 0
        ? `style-src ${distinctStyleHashes.join(
            ' '
          )} ${distinctStyleDomains.join(' ')};`
        : '';

    if (!this.config) {
      return `${scriptSrc} ${styleSrc}`;
    }

    const directives = this.config?.directives
      .filter(
        (x) => x.directive !== 'script-src' && x.directive !== 'style-src'
      )
      .map((directive) => {
        return this.buildDirective(directive);
      });

    const cspDirectives =
      directives?.filter((directive) => directive !== null) || [];

    // remove duplicate spaces, keep one space
    const cspValues: string[] = [];
    if (scriptSrc) {
      cspValues.push(scriptSrc);
    }
    if (styleSrc) {
      cspValues.push(styleSrc);
    }
    cspValues.push(...cspDirectives);
    const cspValuesSet = new Set(cspValues);
    return Array.from(cspValuesSet).join(' ');
  }

  private buildDirective(directiveConfig: DirectiveConfig): string {
    let directive = `${directiveConfig.directive}`;

    // Check if the directive has a `values` property
    if ('values' in directiveConfig) {
      if (Array.isArray(directiveConfig.values)) {
        // Append array values
        directive += ` ${directiveConfig.values.join(' ')}`;
      } else {
        // Append single string value
        directive += ` ${directiveConfig.values}`;
      }
    }

    return directive.trim() + ';';
  }
}
