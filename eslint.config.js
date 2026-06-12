import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      // the domain ring must stay browser-agnostic
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'Date'],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the Random port.' },
      ],
      // dependencies point inward: the domain may import ports, never adapters
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/adapters/**'], message: 'The domain must not import adapters.' },
          ],
        },
      ],
    },
  },
  // dates.ts legitimately needs Date; the browser-global ban still applies.
  {
    files: ['src/domain/dates.ts'],
    rules: { 'no-restricted-globals': ['error', 'window', 'document', 'localStorage'] },
  },
  { ignores: ['dist/', 'node_modules/', 'data/', 'themes/'] },
);
