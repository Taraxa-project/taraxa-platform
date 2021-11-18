module.exports = {
  root: true,
  overrides: [
    {
      // JavaScript and JSX
      files: ['*.{js,jsx}'],
      parserOptions: {
        sourceType: 'module',
      },
      extends: ['airbnb', 'airbnb/hooks', 'prettier', 'prettier/react'],
      plugins: ['prettier'],
      rules: {
        'jsx-a11y/anchor-is-valid': 'off',
        'react/no-unescaped-entities': 'off',
      },
    },
    {
      // Typescript and TSX
      // See https://github.com/toshi-toma/eslint-config-airbnb-typescript-prettier/blob/master/index.js
      files: ['*.{jsx,ts,tsx}'],
      extends: ['airbnb-typescript-prettier'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'react/no-unescaped-entities': 'off',
      },
    },
  ],
  rules: {
    'max-len': [
      'error',
      {
        code: 100,
        ignoreUrls: true,
      },
    ],
  },
};
