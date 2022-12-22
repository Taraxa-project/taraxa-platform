module.exports = {
  overrides: [
    {
      // JavaScript and JSX
      files: ["*.{ts,tsx}"],
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      rules: {
        "no-restricted-exports": "off",
      },
    },
  ],
};
