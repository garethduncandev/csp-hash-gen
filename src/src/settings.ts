import { SHAType } from './sha-type.enum.js';

export interface Settings {
  directory: string;
  sha: SHAType;
  addMetaTag: boolean;
  addIntegrityAttributes: boolean;
  directives: {
    [key: string]: string[];
  };
}
