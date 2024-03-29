module.exports = {
  root: true,
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      // Typescript and TSX
      // See https://github.com/toshi-toma/eslint-config-airbnb-typescript-prettier/blob/master/index.js
      files: ['*.{js,jsx,ts,tsx}'],
      extends: ['airbnb-typescript-prettier'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'import/no-cycle': 'off',
        camelcase: 'off',
        'class-methods-use-this': 'off',
        'max-classes-per-file': 'off',
        'prefer-destructuring': 'off',
        'prefer-spread': 'off',
        'no-alert': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'warn',
        'no-empty': 'off',
        'no-nested-ternary': 'off',
        'no-return-await': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-restricted-exports': 'off',
        'no-underscore-dangle': 'off',
        'react/function-component-definition': 'off',
        'react/no-array-index-key': 'off',
        'react/no-children-prop': 'off',
        'react/no-unescaped-entities': 'off',
        'react/require-default-props': 'off',
        'react/jsx-no-useless-fragment': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'import/prefer-default-export': 'off',
        'import/no-unresolved': [2, { caseSensitive: false }],
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
