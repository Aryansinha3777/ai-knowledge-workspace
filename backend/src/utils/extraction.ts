import fs from 'fs';
import pdfParse from 'pdf-parse';

export async function extractText(filePath: string, fileType: string): Promise<string> {
  if (fileType === 'pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (fileType === 'txt' || fileType === 'md') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}