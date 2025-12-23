export type ModelType = 'TFT' | 'NBeats' | 'Prophet' | 'Chronos2';

export interface ModelConfiguration {
  id: ModelType;
  name: string;
  description: string;
  hyperparameters: Hyperparameter[];
}

export interface Hyperparameter {
  name: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  defaultValue: any;
  options?: string[]; // Solo si el tipo es 'select'
}