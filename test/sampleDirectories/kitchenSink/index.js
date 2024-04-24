interface IAIProvider {
  generate(input: string): Promise<string>;
}

import { Configuration, OpenAIApi } from "openai";
import { Replicate } from "replicate";

class OpenAIService implements IAIProvider {
  private client: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.client = new OpenAIApi(configuration);
  }

  async generate(input: string): Promise<string> {
    try {
      const response = await this.client.createCompletion({
        model: "text-davinci-003",
        prompt: input,
        max_tokens: 150,
      });
      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error("Error generating text with OpenAI:", error);
      throw new Error("Failed to generate text with OpenAI");
    }
  }
}

class CodeLlamaService implements IAIProvider {
  private replicate: Replicate;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  async generate(input: string): Promise<string> {
    try {
      const output = await this.replicate.run(
        "meta/codellama-13b:cc618fca92404570b9c10d1a4fb5321f4faff54a514189751ee8d6543db64c8f",
        {
          input: {
            prompt: input,
          },
        }
      );
      return output;
    } catch (error) {
      console.error("Error generating text with CodeLlama:", error);
      throw new Error("Failed to generate text with CodeLlama");
    }
  }
}

class AIServiceManager {
  private services: { [key: string]: IAIProvider } = {};

  registerService(name: string, service: IAIProvider) {
    this.services[name] = service;
  }

  getService(name: string): IAIProvider {
    if (!this.services[name]) {
      throw new Error(`AI Service named '${name}' is not registered.`);
    }
    return this.services[name];
  }
}

async function generateText(prompt: string, provider: IAIProvider): Promise<string> {
  return await provider.generate(prompt);
}

// Example usage
const aiManager = new AIServiceManager();
aiManager.registerService('OpenAI', new OpenAIService());
aiManager.registerService('CodeLlama', new CodeLlamaService());

const aiService = aiManager.getService('OpenAI'); // Or 'CodeLlama'
generateText("Describe a sunset.", aiService).then(text => console.log(text));
