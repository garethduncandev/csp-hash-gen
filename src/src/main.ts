import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { Settings } from './settings.js';
import { CspGenerator } from './csp-generator.js';
import { parseCsp } from './csp-parser.js';
import { Csp } from './csp.js';
import { SHAType } from './sha-type.enum.js';
import { SettingsUtils } from './utils/settings-utils.js';
import { getFilePaths } from './utils/file-utils.js';
import { getHtmlFileHashes } from './utils/hash-utils.js';
import { addContentSecurityPolicyMetaTag } from './utils/meta-tag-utils.js';

export async function main(
  createEmptyConfig: false | 'empty' | 'full',
  directory: string,
  sha: SHAType,
  insertMetaTag: boolean,
  insertIntegrityAttributes: boolean,
  configPath: string
): Promise<void> {
  const configUtils = new SettingsUtils();

  if (createEmptyConfig) {
    configUtils.createDefaultConfigFile(directory);
    return;
  }

  // Check if the config file exists
  let config: Settings = configUtils.getDefaultConfig();
  console.log('config path', configPath);
  if (fs.existsSync(configPath)) {
    console.log('.csprc file found');
    const configFile = fs.readFileSync(configPath, 'utf-8');
    try {
      config = JSON.parse(configFile) as Settings;
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
  const policies: Csp[] = [];
  for (const htmlFilePath of htmlFilePaths) {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const parsedHtmlContent = cheerio.load(htmlContent);

    const result = await cspGenerator.generateCsp(htmlFilePath, sha);
    policies.push(result);
    console.log(JSON.stringify(result, null, 2));

    // add csp meta tag (and report-to meta tag if needed)
    if (insertMetaTag) {
      const parsedCsp = parseCsp(result);
      console.log('Parsed CSP:', parsedCsp);
      addContentSecurityPolicyMetaTag(
        parsedCsp,
        htmlFilePath,
        parsedHtmlContent
      );
    }

    if (insertIntegrityAttributes) {
      // Recompute script and style hashes for integrity attributes
      const scriptHashesArr = await getHtmlFileHashes(
        path.dirname(htmlFilePath),
        htmlFilePath,
        sha,
        'script'
      );
      for (const scriptHash of scriptHashesArr) {
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
      const styleHashesArr = await getHtmlFileHashes(
        path.dirname(htmlFilePath),
        htmlFilePath,
        sha,
        'style'
      );
      for (const styleHash of styleHashesArr) {
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
  }
}

function createEmptyConfig(): void {}

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
