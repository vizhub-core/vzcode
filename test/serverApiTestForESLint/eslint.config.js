import reactPlugin from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";


export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        requireConfigFile: false,
        babelOptions: {
            presets: ["@babel/preset-react"],
        },
      },
    },
    /*
    environment: {
      browser: true,
      es2021: true,
    },
    */
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
      "no-undef": "error",
      semi: "off",
      "react/jsx-uses-vars": "error",
    },
  },
];