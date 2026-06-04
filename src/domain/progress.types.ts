export interface ItemProgress {
  tasks: Record<string, boolean>;
  reflection: string;
  completedAt: string | null;
  completedHour: number | null;
}
export interface Review { itemId: string; lastDate: string; stage: number; }
export interface Surprise { text: string; at: string; }
export interface ProgressData {
  schema: 'sunrise.progress/v1';
  items: Record<string, ItemProgress>;
  reviews: Review[];
  badges: Record<string, { at: string }>;
  lastSurprise: Surprise | null;
}
