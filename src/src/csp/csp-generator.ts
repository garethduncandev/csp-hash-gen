import { HashResult, HtmlHashes } from '../hashers/hash-result.js';

export class CspGenerator {
  public createCombinedCsp(
    hashes: HtmlHashes[],
    strictDynamic: boolean
  ): string {
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

    const csp = this.createHtmlCsp(combinedHashesArray, strictDynamic);
    return csp;
  }

  public createHtmlCsp(hashes: HashResult[], strictDynamic: boolean): string {
    const scriptSrcSegments = hashes
      .filter((x) => x.resourceType === 'script')
      .map((x) => `'${x.hash}'`);
    let scriptSrc = `script-src ${scriptSrcSegments.join(' ')}`;

    // TODO add strict-dynamic fall back
    if (strictDynamic) {
      scriptSrc = `${scriptSrc} 'strict-dynamic'`;
    }

    scriptSrc = `${scriptSrc};`;

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
    const distinctStyleDomains = [...new Set(styleDomains)];

    // self needs single quotes, domains don't
    const hasSelf = hashes.some(
      (x) => x.resourceType === 'style' && x.domain === 'self'
    );
    if (hasSelf) {
      distinctStyleDomains.push("'self'");
    }

    const styleSrc = `style-src ${distinctStyleHashes.join(
      ' '
    )} ${distinctStyleDomains.join(' ')};`;

    return `${scriptSrc} ${styleSrc}`;
  }
}
