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
        'ro-restricted-exports': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/*.stories.*', '**/.storybook/**/*.*'],
            peerDependencies: true,
          },
        ],
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
            printWidth: 80,
            trailingComma: 'es5',
            semi: true,
            doubleQuote: true,
            jsxSingleQuote: true,
            singleQuote: false,
            useTabs: false,
            tabWidth: 2,
          },
        ],
      },
    },
  ],
};
