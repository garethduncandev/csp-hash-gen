export type HashResult = {
  resourcePath: string | null;
  hash: string;
  external: boolean;
  inline: boolean;
  type: string;
  domain: string | null;
};

export interface HtmlHashes {
  htmlFilePath: string;
  hashes: HashResult[];
}
