interface IAIProvider {
  generate(input: string): Promise<string>;
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