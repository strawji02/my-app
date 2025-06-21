export interface GroundLevelData {
  rawData: Record<string, string | number>[];
  values: number[];
  average: number;
}

export interface GeologicalData {
  rawData: Record<string, string | number>[];
}

export interface CSVRow {
  [key: string]: string | number;
}

export type CalculationType = 'TYPE1' | 'TYPE2';

export interface GeologicalCalculation {
  type: CalculationType;
  columns: string[];
  results: Record<string, number>;
}

export interface ExcavationData {
  name: string;
  length: number;
  width: number;
  depth: number;
  volume: number;
}
