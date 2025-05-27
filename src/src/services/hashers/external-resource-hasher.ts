import { HashResult } from './hash-result.js';
import { SHAType } from '../../sha-type.enum.js';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { ContentHasher } from './content-hasher.js';

export class ExternalResourceHasher extends ContentHasher {
  public async hashHtmlExternalResources(
    htmlFilePath: string,
    absoluteDirectory: string,
    sha: SHAType,
    resourceType: 'script' | 'style'
  ): Promise<HashResult[]> {
    const parsedHtmlContent = this.getParsedHtmlContent(htmlFilePath);
    const externalResources = this.getExternalResources(
      parsedHtmlContent,
      resourceType
    );
    const hashes: HashResult[] = [];

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
    }
    return hashes;
  }

  private getExternalResources(
    parsedHtmlContent: cheerio.CheerioAPI,
    resourceType: 'script' | 'style'
  ): { url: string; type: 'script' | 'style' }[] {
    const externalResources: { url: string; type: 'script' | 'style' }[] = [];
    if (resourceType === 'style') {
      parsedHtmlContent('link[rel="stylesheet"]').each((_, element) => {
        const href = parsedHtmlContent(element).attr('href');
        if (href) {
          externalResources.push({ url: href, type: 'style' });
        }
      });
    } else if (resourceType === 'script') {
      parsedHtmlContent('script[src]').each((_, element) => {
        const src = parsedHtmlContent(element).attr('src');
        if (src) {
          externalResources.push({ url: src, type: 'script' });
        }
      });
    }
    return externalResources;
  }

  private getParsedHtmlContent(htmlFilePath: string): cheerio.CheerioAPI {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    return cheerio.load(htmlContent);
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
      src: resourcePath,
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
      src: url,
      hash: resourceHash,
      resourceLocation: 'remote',
      resourceType: resourceType,
      domain: domain,
    };
  }
}
