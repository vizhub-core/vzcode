import Together from 'together-ai';
import { z } from 'zod';

const options: ConstructorParameters<typeof Together>[0] =
  process.env.HELICONE_API_KEY
    ? {
        baseURL: 'https://together.helicone.ai/v1',
        defaultHeaders: {
          'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
        },
      }
    : {};

const together = new Together(options);

export async function POST(req: Request) {
  const json = await req.json();
  const result = z
    .object({
      model: z.string(),
      shadcn: z.boolean().default(false),
      messages: z.array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        }),
      ),
    })
    .safeParse(json);

  if (result.error) {
    return new Response(result.error.message, {
      status: 422,
    });
  }

  const { model, messages, shadcn } = result.data;
  const systemPrompt = `
    You are an expert frontend React engineer and UI/UX designer. Create a React component based on user requests.
    - Use TypeScript with Tailwind for styling.
    - Ensure the React code is functional, self-contained, and uses no required props.
    - Use consistent Tailwind classes for spacing and colors.
    - For placeholder images, use: <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />.
    - Only return the React code starting with imports. No backticks or annotations like \`typescript\` or \`tsx\`.
  `;

  const res = await together.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map((message) => ({
        role: message.role,
        content:
          message.role === 'user'
            ? `${message.content}\nPlease ONLY return code, NO backticks or language names.`
            : message.content,
      })),
    ],
    stream: true,
    temperature: 0.2,
  });

  return new Response(res.toReadableStream());
}

export const runtime = 'edge';
