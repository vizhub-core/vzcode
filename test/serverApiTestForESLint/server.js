import express from 'express';
import { ESLint } from "eslint";
import bodyParser from "body-parser";
import cors from 'cors'; 


const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let eslint;

/*
eslint = new ESLint({
  overrideConfigFile: null, 
  baseConfig: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      ecmaFeatures: { jsx: true },

    },
    env: {
      browser: true,
      es2021: true,
    },
    plugins: ["react"],
    rules: {
      "no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
      "no-undef": "error",
      semi: "off",
    },
  },
});
*/

async function createEslintInstance() {
  const reactPlugin = (await import('eslint-plugin-react')).default;

  eslint = new ESLint({
    overrideConfigFile: null,  
    overrideConfig: {
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      env: {
        browser: true,
        es2021: true,
      },
      plugins: {
        react: reactPlugin,
      },
      rules: {
        'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
        'no-undef': 'error',
        semi: 'off',
      },
    },
  });
}

await createEslintInstance();

//errors

app.post("/lint", async (req, res) => {
  if (!eslint) {
    return res.status(500).json({ error: "ESLint not initialized" });
  }

  const code = req.body.code;

  if (typeof code !== "string") {
    return res.status(400).json({ error: "Invalid code format" });
  }

  try {
    const results = await eslint.lintText(code, { filePath: "file.js" });
    res.json(results[0].messages);
  } catch (err) {
    console.error("ESLint Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`ESLint server running at http://localhost:${port}`);
});

