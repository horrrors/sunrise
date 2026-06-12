export interface ItemProgress {
  tasks: Record<string, boolean>;
  reflection: string;
  completedAt: string | null;
  completedHour: number | null;
}
export interface ProgressData {
  schema: 'sunrise.progress/v1';
  items: Record<string, ItemProgress>;
  badges: Record<string, { at: string }>;
}
