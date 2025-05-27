import { SHAType } from './sha-type.enum.js';

export interface Config {
  directory: string;
  sha: SHAType;
  addMetaTag: boolean;
  addIntegrityAttributes: boolean;
  directives: {
    [key: string]: string[];
  };
}
