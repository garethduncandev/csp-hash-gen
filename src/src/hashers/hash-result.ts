export interface HashResult {
  src?: string | null;
  hash: string;
  resourceLocation: 'local' | 'remote' | 'embedded' | 'inline';
  resourceType: 'script' | 'style';
  domain: string | null;
}
