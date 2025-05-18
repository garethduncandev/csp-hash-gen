import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { SHAType } from './sha-type.enum.js';
import { CspGenerator } from './csp-generator.js';
import { MetaTagHelper } from './utils/meta-tag-utils.js';
import { getFilePaths } from './utils/file-utils.js';
import { getHtmlFileHashes } from './utils/hash-utils.js';
import { HtmlHashes } from './hashers/hash-result.js';
import { Config } from './config.js';
import { ConfigUtils } from './utils/config-utils.js';

export async function main(options: {
  createEmptyConfig: false | 'empty' | 'full';
  directory: string;
  sha: SHAType;
  insertMetaTag: boolean;
  insertIntegrityAttributes: boolean;
  configPath: string;
}): Promise<void> {
  if (options.createEmptyConfig) {
    const configUtils = new ConfigUtils();

    // Create an empty config file
    const emptyConfig = configUtils.createEmptyConfig(
      options.directory,
      options.createEmptyConfig
    );
    console.log(emptyConfig);
    console.log('Created empty config file at csp-config.json');
    return;
  }

  // Check if the config file exists
  let config: Config | undefined = undefined;
  // update ./.csrpc based on directory
  const configurationPath = path.resolve(options.directory, '.csprc');

  if (fs.existsSync(configurationPath)) {
    const configFile = fs.readFileSync(configurationPath, 'utf-8');
    try {
      config = JSON.parse(configFile) as Config;
    } catch (error) {
      console.error('Error parsing config file:', error);
      return;
    }
  }

  const cspGenerator = new CspGenerator(config);
  const metaTagHelper = new MetaTagHelper();

  const allFilePaths = getFilePaths(path.resolve(options.directory));
  const htmlFilePaths = allFilePaths.filter((filePath) =>
    ['.html', '.htm'].includes(path.extname(filePath))
  );

  const hashes: HtmlHashes[] = [];

  const createHashes = config?.calculateHashes ?? false;
  if (createHashes) {
    for (let htmlFilePath of htmlFilePaths) {
      const absoluteDir = path.resolve(path.dirname(htmlFilePath));

      const htmlHashes = await getHtmlFileHashes(
        absoluteDir,
        htmlFilePath,
        options.sha,
        options.insertIntegrityAttributes
      );

      const htmlCsp = cspGenerator.createHtmlCsp(htmlHashes);

      console.log(`CSP for ${htmlFilePath}`);
      console.log(htmlCsp);
      console.log('');
      console.log(
        '------------------------------------------------------------'
      );

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
  }

  console.log(JSON.stringify(hashes, null, 2));
  console.log('');
  console.log('------------------------------------------------------------');
  const csp = cspGenerator.createCombinedCsp(hashes);
  console.log('');
  console.log(`CSP combined:`);
  console.log(csp);
}
