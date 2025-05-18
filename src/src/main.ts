import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { SHAType } from './sha-type.enum.js';
import { CspGenerator } from './csp-generator.js';
import { MetaTagHelper } from './utils/meta-tag-utils.js';
import { getFilePaths } from './utils/file-utils.js';
import { getHtmlFileHashes } from './utils/hash-utils.js';
import { HtmlHashes } from './hashers/hash-result.js';

export async function main(options: {
  directory: string;
  sha: SHAType;
  strictDynamic: boolean;
  insertMetaTag: boolean;
  insertIntegrityAttributes: boolean;
}): Promise<void> {
  const cspGenerator = new CspGenerator();
  const metaTagHelper = new MetaTagHelper();

  const allFilePaths = getFilePaths(path.resolve(options.directory));
  const htmlFilePaths = allFilePaths.filter((filePath) =>
    ['.html', '.htm'].includes(path.extname(filePath))
  );

  const hashes: HtmlHashes[] = [];

  for (let htmlFilePath of htmlFilePaths) {
    const absoluteDir = path.resolve(path.dirname(htmlFilePath));

    const htmlHashes = await getHtmlFileHashes(
      absoluteDir,
      htmlFilePath,
      options.sha,
      options.insertIntegrityAttributes
    );

    const htmlCsp = cspGenerator.createHtmlCsp(
      htmlHashes,
      options.strictDynamic
    );

    console.log(`CSP for ${htmlFilePath}`);
    console.log(htmlCsp);
    console.log('');
    console.log('------------------------------------------------------------');

    if (options.insertMetaTag) {
      const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
      const parsedHtmlContent = cheerio.load(htmlContent);
      metaTagHelper.addMetaTag(htmlCsp, htmlFilePath, parsedHtmlContent);
    }

    const result: HtmlHashes = {
      hashes: htmlHashes,
      htmlFilePath: htmlFilePath,
    };
    hashes.push(result);
  }

  console.log(JSON.stringify(hashes, null, 2));
  console.log('');
  console.log('------------------------------------------------------------');
  const csp = cspGenerator.createCombinedCsp(hashes, options.strictDynamic);
  console.log('');
  console.log(`CSP combined:`);
  console.log(csp);
}
