export type SpineLength = "shortened" | "full";

export interface BeatDefinition {
  id: string;
  prompt: string;
  hint?: string;
}

export type BeatText = Record<string, string>;
export type ChecklistMap = Record<string, boolean>;

export interface Story {
  id: string;
  title: string;
  length: SpineLength;
  beats: BeatText;
  checks: ChecklistMap;
  createdAt: number;
  updatedAt: number;
}
