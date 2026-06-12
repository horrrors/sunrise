export interface ItemProgress {
  tasks: Record<string, boolean>;
  reflection: string;
  completedAt: string | null;
  completedHour: number | null;
}
export interface Review {
  itemId: string;
  lastDate: string;
}
export interface ProgressData {
  schema: 'sunrise.progress/v1';
  items: Record<string, ItemProgress>;
  reviews: Review[];
  badges: Record<string, { at: string }>;
}
