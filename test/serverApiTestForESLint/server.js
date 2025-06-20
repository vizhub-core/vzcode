import express from 'express';
import { ESLint } from "eslint";
import bodyParser from "body-parser";
import cors from 'cors'; 


const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

//Lint endpoint
app.post("/lint", async (req, res) => {
  const code = req.body.code;

  if (typeof code !== "string") {
    return res.status(400).json({ error: "Invalid code format" });
  }

  const eslint = new ESLint({
    baseConfig: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      env: { browser: true, es2021: true },
      rules: {
        "no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
        "no-undef": "error",
        semi: "off",
      },
    },
    useEslintrc: false,
  });

  try {
    const results = await eslint.lintText(code, { filePath: "file.jsx" });
    res.json(results[0].messages);
  } catch (err) {
    console.error("ESLint Error:", err);
    res.status(500).json({ error: err.message });
  }
});


//console
app.listen(port, () => {
  console.log(`ESLint server running at http://localhost:${port}`);
});
