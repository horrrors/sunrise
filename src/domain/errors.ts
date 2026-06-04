export interface ValidationIssue { readonly path: string; readonly msg: string; }

export class ValidationError extends Error {
  readonly issues: readonly ValidationIssue[];
  constructor(issues: readonly ValidationIssue[]) {
    super(issues.map((i) => `${i.path}: ${i.msg}`).join('; ') || 'validation failed');
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}
