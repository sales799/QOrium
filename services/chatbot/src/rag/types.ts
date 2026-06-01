import type { Citation } from '../types.js';

export interface CorpusChunk extends Citation {
  content: string;
}

export interface RetrievedChunk extends CorpusChunk {
  score: number;
}

export interface Retriever {
  search(query: string, limit: number): Promise<RetrievedChunk[]>;
}
