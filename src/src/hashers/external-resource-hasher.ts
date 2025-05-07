import { HashResult } from './hash-result.js';
import { SHAType } from '../sha-type.enum.js';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { ContentHasher } from './content-hasher.js';

export class ExternalResourceHasher extends ContentHasher {
  public async hashHtmlExternalResources(
    htmlFilePath: string,
    absoluteDirectory: string,
    sha: SHAType,
    addIntegrity: boolean,
    parsedHtmlContent: cheerio.CheerioAPI
  ): Promise<HashResult[]> {
    const externalResources: { url: string; type: 'style' | 'script' }[] = [];
    const hashes: HashResult[] = [];

    parsedHtmlContent('link[rel="stylesheet"]').each((_, element) => {
      const href = parsedHtmlContent(element).attr('href');
      if (href) {
        externalResources.push({ url: href, type: 'style' });
      }
    });

    parsedHtmlContent('script[src]').each((_, element) => {
      const src = parsedHtmlContent(element).attr('src');
      if (src) {
        externalResources.push({ url: src, type: 'script' });
      }
    });

    for (const externalResource of externalResources) {
      const hashResult = await this.hashResource(
        absoluteDirectory,
        externalResource.url,
        sha,
        externalResource.type
      );
      if (!hashResult) {
        continue;
      }

      hashes.push(hashResult);
      if (!addIntegrity) {
        continue;
      }

      // add integrity attribute to the resource element
      const element =
        externalResource.type === 'script'
          ? parsedHtmlContent(`script[src="${externalResource.url}"]`)
          : parsedHtmlContent(`link[href="${externalResource.url}"]`);

      // check if script tag already has integrity attribute
      element.attr('integrity', hashResult.hash);

      // save the updated HTML content back to the file
      fs.writeFileSync(htmlFilePath, parsedHtmlContent.html(), 'utf-8');
    }
    return hashes;
  }

  private async hashResource(
    absoluteDir: string,
    resourcePath: string,
    sha: SHAType,
    resourceType: 'script' | 'style'
  ): Promise<HashResult | null> {
    const isRemote =
      resourcePath.startsWith('http') || resourcePath.startsWith('//');

    if (isRemote) {
      return await this.hashRemoteFile(resourcePath, sha, resourceType);
    }

    // local file
    return this.hashLocalResource(absoluteDir, resourcePath, sha, resourceType);
  }

  private hashLocalResource(
    absoluteDir: string,
    resourcePath: string,
    sha: SHAType,
    resourceType: 'script' | 'style'
  ): HashResult | null {
    const absoluteFilePath = path.join(absoluteDir, resourcePath);
    const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');
    const resourceHash = this.hashContent(fileContent, sha);

    return {
      resourcePath: absoluteFilePath,
      hash: resourceHash,
      resourceLocation: 'local',
      resourceType: resourceType,
      domain: 'self',
    };
  }

  private async hashRemoteFile(
    url: string,
    sha: SHAType,
    resourceType: 'script' | 'style'
  ): Promise<HashResult | null> {
    if (url.startsWith('//')) {
      url = `https:${url}`; // Prepend https if the URL starts with //
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `Failed to fetch ${url} - unable to hash: ${response.statusText}`
      );
      return null;
    }
    const resourceContent = await response.text();
    const resourceHash = this.hashContent(resourceContent, sha);
    const parsedUrl = new URL(url);
    const domain = `${parsedUrl.protocol}//${parsedUrl.hostname}` || null; // Fixed variable reference

    return {
      resourcePath: url,
      hash: resourceHash,
      resourceLocation: 'remote',
      resourceType: resourceType,
      domain: domain,
    };
  }
}
