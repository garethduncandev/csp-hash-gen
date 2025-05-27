import * as fs from 'fs';
import * as path from 'path';

export function getFilePaths(dir: string): string[] {
  const files: string[] = [];

  function readDirectory(directory: string): void {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        readDirectory(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  readDirectory(dir);
  return files;
}
