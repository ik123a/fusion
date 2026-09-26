import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCodeSuggestion(
  code: string,
  instruction: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert software engineer. Suggest improvements to the given code.
                  Return only the improved code with brief comments explaining changes.`,
      },
      {
        role: "user",
        content: `Code:\n${code}\n\nInstruction: ${instruction}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateDocumentation(
  code: string,
  language: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a technical writer. Generate comprehensive documentation for the given ${language} code.
                  Include function descriptions, parameter explanations, return values, and usage examples.`,
      },
      {
        role: "user",
        content: code,
      },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function analyzeCode(
  code: string,
  language: string
): Promise<{ suggestions: string[]; issues: string[] }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a code reviewer. Analyze the given ${language} code and provide:
                  1. Suggestions for improvement
                  2. Potential issues or bugs
                  Return as JSON with "suggestions" and "issues" arrays.`,
      },
      {
        role: "user",
        content: code,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content);
}

export async function generateTests(
  code: string,
  language: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a test engineer. Generate comprehensive unit tests for the given ${language} code.
                  Include edge cases and error scenarios.`,
      },
      {
        role: "user",
        content: code,
      },
    ],
    temperature: 0.4,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "";
}
