#!/usr/bin/env node

import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { HashResult, HtmlHashes } from './hashers/hash-result.js';
import { SHAType } from './sha-type.enum.js';
import { FileHasher } from './hashers/file-hasher.js';
import { CspGenerator } from './csp/csp-generator.js';
import { JsFileHasher } from './hashers/js-file-hasher.js';
import { JsInlineHasher } from './hashers/js-inline-hasher.js';
import { CssFileHasher } from './hashers/css-file-hasher.js';
import { CssInlineHasher } from './hashers/css-inline-hasher.js';
import { MetaTagHelper } from './csp/meta-tag-helper.js';

const program = new commander.Command();

program
  .option('-s, --sha', 'SHA type - sha256, sha384 or sha512', 'sha256')
  .option('-d, --strict-dynamic', 'Enable strict dynamic', false)
  .option('-m, --add-meta-tag', 'Add meta tag containing csp', false)
  .option(
    '-i, --integrity',
    'Update html script with integrity attributes',
    false
  )
  .argument('<string>', 'app directory')
  .action(async (inputDirectory, options) => {
    await main(inputDirectory, {
      ...options,
      strictDynamic: options.strictDynamic,
    });
  });

program.parse(process.argv);

async function main(
  dir: string,
  options: {
    sha: SHAType;
    strictDynamic: boolean;
    integrity: boolean;
    addMetaTag: boolean;
  }
): Promise<void> {
  // const find all scripts and css imported in the html file
  const cspHasher = new FileHasher();
  const cspGenerator = new CspGenerator();
  const jsFileHasher = new JsFileHasher(cspHasher);
  const jsInlineHasher = new JsInlineHasher(cspHasher);
  const cssFileHasher = new CssFileHasher(cspHasher);
  const cssInlineHasher = new CssInlineHasher(cspHasher);
  const metaTagHelper = new MetaTagHelper();

  const absoluteDir = path.resolve(dir);
  const allFilePaths = getFilePaths(absoluteDir);
  const htmlFilePaths = allFilePaths.filter((filePath) =>
    ['.html', '.htm'].includes(path.extname(filePath))
  );

  const hashes: HtmlHashes[] = [];

  for (let htmlFilePath of htmlFilePaths) {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    // Parse the HTML with cheerio
    const parsedHtmlContent = cheerio.load(htmlContent);

    const jsFileHashes = await jsFileHasher.hashFile(
      htmlFilePath,
      absoluteDir,
      options.sha,
      options.integrity,
      parsedHtmlContent
    );

    const inlineJsHashes = jsInlineHasher.hashInlineScripts(
      //htmlFilePath,
      options.sha,
      parsedHtmlContent
    );

    const cssFileHashes = await cssFileHasher.hashFile(
      htmlFilePath,
      absoluteDir,
      options.sha,
      options.integrity,
      parsedHtmlContent
    );

    const inlineCssHashes = cssInlineHasher.hashInlineStyles(
      //htmlFilePath,
      options.sha,
      parsedHtmlContent
    );

    const htmlHashes: HashResult[] = [
      ...jsFileHashes,
      ...inlineJsHashes,
      ...cssFileHashes,
      ...inlineCssHashes,
    ];

    hashes.push({ htmlFilePath: htmlFilePath, hashes: htmlHashes });

    const htmlCsp = cspGenerator.createHtmlCsp(
      htmlHashes,
      options.strictDynamic
    );
    console.log(`CSP for ${htmlFilePath}: ${htmlCsp}`);

    if (options.addMetaTag) {
      const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
      // Parse the HTML with cheerio
      const parsedHtmlContent = cheerio.load(htmlContent);
      metaTagHelper.addMetaTag(htmlCsp, htmlFilePath, parsedHtmlContent);
    }
  }

  console.log(hashes);
  const csp = cspGenerator.createCombinedCsp(hashes, options.strictDynamic);
  console.log(`CSP combined: ${csp}`);
}

function getFilePaths(dir: string): string[] {
  const files: string[] = [];

  function readDirectory(directory: string): void {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        // Recursively read subdirectories
        readDirectory(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  readDirectory(dir);
  return files;
}
