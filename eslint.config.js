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
    },
  },
  { ignores: ['dist/', 'node_modules/', 'data/', 'themes/', 'logic.js', 'app.js', 'core/'] },
);
