export interface Rejection {
  kind: 'pack' | 'theme';
  id: string;
  issues: readonly { path: string; msg: string }[];
}
