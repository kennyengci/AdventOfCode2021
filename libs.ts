import { readFileSync } from 'fs';

export function readAndSplitTxtFile(fileName: string): string[] {
    return readFileSync(fileName, {encoding: 'utf-8'}).split('\r\n')
}

