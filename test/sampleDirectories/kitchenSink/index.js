interface IAIProvider {
  generate(input: string): Promise<string>;
}
import { Configuration, OpenAIApi } from "openai";

class OpenAIService implements IAIProvider {
  private client: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.client = new OpenAIApi(configuration);
  }

  async generate(input: string): Promise<string> {
    const response = await this.client.createCompletion({
      model: "text-davinci-003",
      prompt: input,
      max_tokens: 150,
    });
    return response.data.choices[0].text.trim();
  }
}

class CodeLlamaService implements IAIProvider {
  async generate(input: string): Promise<string> {
    const Replicate = require("replicate");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "meta/codellama-13b:cc618fca92404570b9c10d1a4fb5321f4faff54a514189751ee8d6543db64c8f",
      {
        input: {
          prompt: input,
        },
      }
    );

    return output;
  }
}

class OpenAIService implements IAIProvider {
  async generate(input: string): Promise<string> {
    // OpenAI API call with `input`
    return ""; // Placeholder for the response from OpenAI
  }
}

async function generateText(prompt: string, provider: IAIProvider): Promise<string> {
  return await provider.generate(prompt);
}

// Example usage
const aiService = new CodeLlamaService(); // Or new OpenAIService() or any other AI service
const text = await generateText("Describe a sunset.", aiService);
console.log(text);