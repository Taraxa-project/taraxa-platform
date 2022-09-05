module.exports = {
  overrides: [
    {
      // JavaScript and JSX
      files: ['*.{ts,tsx}'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        'no-restricted-exports': 'off',
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
            printWidth: 80,
            trailingComma: 'es5',
            semi: true,
            doubleQuote: false,
            jsxSingleQuote: true,
            singleQuote: true,
            useTabs: false,
            tabWidth: 2,
          },
        ],
      },
    },
  ],
};
