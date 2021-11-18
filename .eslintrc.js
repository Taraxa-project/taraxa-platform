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
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'import/no-cycle': 'off',
        camelcase: 'off',
        'prefer-destructuring': 'off',
        'prefer-spread': 'off',
        'no-alert': 'off',
        'no-await-in-loop': 'off',
        'no-empty': 'off',
        'no-nested-ternary': 'off',
        'no-return-await': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-underscore-dangle': 'off',
        'react/no-array-index-key': 'off',
        'react/no-children-prop': 'off',
        'react/require-default-props': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react-hooks/exhaustive-deps': 'off',
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
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'import/no-cycle': 'off',
        camelcase: 'off',
        'prefer-destructuring': 'off',
        'prefer-spread': 'off',
        'no-alert': 'off',
        'no-await-in-loop': 'off',
        'no-empty': 'off',
        'no-nested-ternary': 'off',
        'no-return-await': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-underscore-dangle': 'off',
        'react/no-array-index-key': 'off',
        'react/no-children-prop': 'off',
        'react/no-unescaped-entities': 'off',
        'react/require-default-props': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react-hooks/exhaustive-deps': 'off',
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
