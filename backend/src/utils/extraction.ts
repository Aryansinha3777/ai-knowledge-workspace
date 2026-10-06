import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export async function extractText(filePath: string, fileType: string): Promise<string> {
  if (fileType === 'pdf') {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  if (fileType === 'txt' || fileType === 'md') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}