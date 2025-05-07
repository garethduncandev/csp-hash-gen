#!/usr/bin/env node

import * as commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { HashResult, HtmlHashes } from './hashers/hash-result.js';
import { SHAType } from './sha-type.enum.js';
import { ExternalResourceHasher } from './hashers/external-resource-hasher.js';
import { CspGenerator } from './csp/csp-generator.js';
import { MetaTagHelper } from './csp/meta-tag-helper.js';
import { EmbeddedResourceHasher } from './hashers/embedded-resource-hasher.js';

const program = new commander.Command();
// const cspHasher = new ExternalResourceHasher();

program
  .option('-d, --directory <string> ', 'Directory', './')
  .option('--sha', 'SHA type - sha256, sha384 or sha512', 'sha256')
  .option('--strict-dynamic', 'Enable strict dynamic', false)
  .option(
    '--insert-meta-tag',
    'Insert csp meta tag into head of html file',
    false
  )
  .option(
    '--insert-integrity-attributes',
    'Update html script with integrity attributes',
    false
  )
  .action(async (options) => {
    await main({
      ...options,
    });
  });

program.parse(process.argv);

async function main(options: {
  directory: string;
  sha: SHAType;
  strictDynamic: boolean;
  insertMetaTag: boolean;
  insertIntegrityAttributes: boolean;
}): Promise<void> {
  // const find all scripts and css imported in the html file

  const cspGenerator = new CspGenerator();

  const metaTagHelper = new MetaTagHelper();

  //const absoluteDir = path.resolve(options.directory);
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
      // Parse the HTML with cheerio
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

async function getHtmlFileHashes(
  absoluteDir: string,
  htmlFilePath: string,
  sha: SHAType,
  addIntegrityAttributes: boolean
): Promise<HashResult[]> {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  // Parse the HTML with cheerio
  const parsedHtmlContent = cheerio.load(htmlContent);

  const externalResourceHasher = new ExternalResourceHasher();
  const externalResourceHashes =
    await externalResourceHasher.hashHtmlExternalResources(
      htmlFilePath,
      absoluteDir,
      sha,
      addIntegrityAttributes,
      parsedHtmlContent
    );
  const embeddedResourceHasher = new EmbeddedResourceHasher();
  const embeddedResourceHashes =
    await embeddedResourceHasher.hashEmbeddedResources(sha, parsedHtmlContent);

  const htmlHashes: HashResult[] = [
    ...externalResourceHashes,
    ...embeddedResourceHashes,
  ];

  return htmlHashes;
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
