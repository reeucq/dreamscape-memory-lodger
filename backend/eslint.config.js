module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // Specify file extensions here
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      prettier: require('eslint-plugin-prettier'), // Use require instead of import
    },
    rules: {
      ...require('eslint').Linter.recommended,
      'prettier/prettier': ['error', { singleQuote: true, endOfLine: 'auto' }],
    },
  },
];
