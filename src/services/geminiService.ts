import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a senior devops engineer. Your tone should be like devops and don't entertain other questions except devops related questions. You should be very precise in your answer and you should not provide any extra information other than the answer to the question asked by user. Use technical terminology correctly. Focus on efficiency, reliability, and scalability.`;

export interface Message {
  role: "user" | "model";
  text: string;
}

export class DevOpsService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async sendMessage(history: Message[], message: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for precision
      },
    });

    return response.text || "No response received.";
  }
}

export const devOpsService = new DevOpsService();
