import { ModelId } from './types';

export const DEFAULT_SETTINGS = {
  apiKeyName: '',
  apiKeyValue: '',
  selectedModel: ModelId.BALANCED,
  selectedModelName: 'Balanced'
};

export const MODEL_OPTIONS = [
  { id: ModelId.FAST, name: 'Fast Model', label: 'Fast' },
  { id: ModelId.BALANCED, name: 'Balanced Model', label: 'Balanced' },
  { id: ModelId.ADVANCED, name: 'Advanced Model', label: 'Advanced' }
];

export const SUGGESTIONS = [
  { label: 'Create image', icon: 'image', action: 'create_image' },
  { label: 'Write', icon: 'pen', action: 'write_draft' },
  { label: 'Build', icon: 'code', action: 'code_snippet' },
  { label: 'Learn', icon: 'graduation-cap', action: 'explain_concept' }
];