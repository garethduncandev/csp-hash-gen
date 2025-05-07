export interface HashResult {
  resourcePath: string | null;
  hash: string;
  resourceLocation: 'local' | 'remote' | 'inline' | 'embedded';
  resourceType: 'script' | 'style';
  domain: string | null;
}

export interface HtmlHashes {
  htmlFilePath: string;
  hashes: HashResult[];
}
