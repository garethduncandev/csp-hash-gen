import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config/config.js';
import { Csp } from './csp/csp.js';
import { SHAType } from './hashers/sha-type.js';
import { generateCsp, stringifyCsp } from './csp/csp-generator.js';
import { getFilePaths } from './utils/file-utils.js';
import { addContentSecurityPolicyMetaTag } from './utils/meta-tag-utils.js';
import { HashResult } from './hashers/hash-result.js';

export async function main(
  directory: string,
  sha: SHAType,
  insertMetaTag: boolean,
  insertIntegrityAttributes: boolean,
  config: Config
): Promise<void> {
  const allFilePaths = getFilePaths(path.resolve(directory));
  const htmlFilePaths = allFilePaths.filter((filePath) =>
    ['.html', '.htm'].includes(path.extname(filePath))
  );

  const policies: Csp[] = [];
  for (const htmlFilePath of htmlFilePaths) {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const parsedHtmlContent = cheerio.load(htmlContent);

    const result = await generateCsp(config.directives, htmlFilePath, sha);
    const csp = result.csp;

    policies.push(csp);
    console.log(JSON.stringify(result, null, 2));

    // add csp meta tag (and report-to meta tag if needed)
    if (insertMetaTag) {
      const parsedCsp = stringifyCsp(csp);
      console.log('Parsed CSP:', parsedCsp);
      addContentSecurityPolicyMetaTag(
        parsedCsp,
        htmlFilePath,
        parsedHtmlContent
      );
    }

    if (insertIntegrityAttributes) {
      addIntegrityAttributes(htmlFilePath, parsedHtmlContent, result.hashes);
    }
  }
}

function addIntegrityAttributes(
  htmlFilePath: string,
  parsedHtmlContent: cheerio.CheerioAPI,
  hashes: HashResult[]
): void {
  for (const hash of hashes) {
    if (
      hash.src &&
      (hash.resourceType === 'script' || hash.resourceType === 'style')
    ) {
      addIntegrityAttribute(
        htmlFilePath,
        parsedHtmlContent,
        hash.src,
        hash.resourceType,
        hash.hash
      );
    }
  }
}

function addIntegrityAttribute(
  htmlFilePath: string,
  parsedHtmlContent: cheerio.CheerioAPI,
  resourceUrl: string,
  resourceType: 'script' | 'style',
  hash: string
) {
  const element =
    resourceType === 'script'
      ? parsedHtmlContent(`script[src="${resourceUrl}"]`)
      : parsedHtmlContent(`link[href="${resourceUrl}"]`);
  element.attr('integrity', hash);
  fs.writeFileSync(htmlFilePath, parsedHtmlContent.html(), 'utf-8');
}
