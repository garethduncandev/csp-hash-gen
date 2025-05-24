import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config.js';
import { CspGenerator } from './csp-generator.js';
import { CspParser } from './csp-parser.js';
import { Csp } from './csp.js';
import { SHAType } from './sha-type.enum.js';
import { ConfigUtils } from './utils/config-utils.js';
import { getFilePaths } from './utils/file-utils.js';
import { addContentSecurityPolicyMetaTag } from './utils/meta-tag-utils.js';

export async function main(
  createEmptyConfig: false | 'empty' | 'full',
  directory: string,
  sha: SHAType,
  insertMetaTag: boolean,
  insertIntegrityAttributes: boolean,
  configPath: string
): Promise<void> {
  const configUtils = new ConfigUtils();

  // Check if the config file exists
  let config: Config = configUtils.getDefaultConfig();
  console.log('config path', configPath);
  if (fs.existsSync(configPath)) {
    console.log('.csprc file found');
    const configFile = fs.readFileSync(configPath, 'utf-8');
    try {
      config = JSON.parse(configFile) as Config;
    } catch (error) {
      console.error('Error parsing config file:', error);
      return;
    }
  }

  const allFilePaths = getFilePaths(path.resolve(directory));
  const htmlFilePaths = allFilePaths.filter((filePath) =>
    ['.html', '.htm'].includes(path.extname(filePath))
  );

  var cspGenerator = new CspGenerator(config);
  const cspParser = new CspParser(config);

  const policies: Csp[] = [];
  for (const htmlFilePath of htmlFilePaths) {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const parsedHtmlContent = cheerio.load(htmlContent);

    const result = await cspGenerator.generateCsp(htmlFilePath, sha);
    policies.push(result);
    console.log(JSON.stringify(result, null, 2));

    // add csp meta tag (and report-to meta tag if needed)

    if (insertMetaTag) {
      const parsedCsp = cspParser.parseCsp(result);
      console.log('Parsed CSP:', parsedCsp);
      addContentSecurityPolicyMetaTag(
        parsedCsp,
        htmlFilePath,
        parsedHtmlContent
      );
    }

    if (insertIntegrityAttributes) {
      for (const scriptHash of result.directives['script-src'].hashes) {
        if (scriptHash.src) {
          addIntegrityAttribute(
            htmlFilePath,
            parsedHtmlContent,
            scriptHash.src,
            'script',
            scriptHash.hash
          );
        }
      }

      for (const styleHash of result.directives['style-src'].hashes) {
        if (styleHash.src) {
          addIntegrityAttribute(
            htmlFilePath,
            parsedHtmlContent,
            styleHash.src,
            'style',
            styleHash.hash
          );
        }
      }
    }

    // merge stuff here
    const mergedCsp = cspGenerator.mergePolicies(policies);

    console.log('Merged CSP:', JSON.stringify(mergedCsp, null, 2));
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
