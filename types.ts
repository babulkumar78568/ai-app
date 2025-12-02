export enum ModelId {
  FAST = 'gemini-2.5-flash',
  BALANCED = 'gemini-2.5-flash', // Using flash as balanced for now, can be swapped
  ADVANCED = 'gemini-3-pro-preview',
  IMAGE = 'gemini-2.5-flash-image'
}

export enum ViewMode {
  CHAT = 'CHAT',
  IMAGE_GEN = 'IMAGE_GEN'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUri?: string; // For generated images
  timestamp: number;
}

export interface AppSettings {
  apiKeyName: string;
  apiKeyValue: string;
  selectedModel: ModelId;
  selectedModelName: string; // "Fast", "Balanced", "Advanced"
}