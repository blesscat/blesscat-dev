export interface Dive {
  num: number;
  date: string;
  location?: string;
  bottom_time?: number;
  max_depth: number;
  avg_depth?: number;
  water_temp?: number;
  gas?: string;
  avg_hr?: number | null;
  entry_lat?: number | null;
  entry_lon?: number | null;
  exit_lat?: number | null;
  exit_lon?: number | null;
  lat?: number | null;
  lon?: number | null;
  garmin_id?: string | null;
}

export interface DiveProfilePoint {
  t: number;
  depth: number;
  hr: number | null;
}

export type DiveProfiles = Record<string, DiveProfilePoint[]>;
