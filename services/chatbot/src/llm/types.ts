import type { Citation, ChatMessage } from '../types.js';

export interface ChatCompletionInput {
  message: string;
  pagePath: string;
  citations: Citation[];
  history: ChatMessage[];
}

export interface ChatCompletionOutput {
  reply: string;
}

export interface ChatModel {
  complete(input: ChatCompletionInput): Promise<ChatCompletionOutput>;
}
