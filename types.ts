export enum CategoryType {
  DO = 'DO',
  BE = 'BE',
  FEEL = 'FEEL'
}

export interface MotivationItem {
  id: string;
  text: string;
}

export interface MotivationModelData {
  topic: string;
  doItems: MotivationItem[];
  beItems: MotivationItem[];
  feelItems: MotivationItem[];
}

export interface DiagramConfig {
  showLabels: boolean;
  zoom: number;
}