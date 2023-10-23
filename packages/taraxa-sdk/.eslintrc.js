module.exports = {
  overrides: [
    {
      files: ['*.{ts}'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        'ro-restricted-exports': 'off',
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
