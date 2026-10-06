interface ChunkOptions {
  chunkSize: number;
  overlap: number;
}

const DEFAULT_OPTIONS: ChunkOptions = {
  chunkSize: 1500,
  overlap: 250,
};

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function chunkText(text: string, options: Partial<ChunkOptions> = {}): string[] {
  const { chunkSize, overlap } = { ...DEFAULT_OPTIONS, ...options };
  const chunks: string[] = [];

  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end === text.length) break;

    start += chunkSize - overlap;
  }

  return chunks;
}