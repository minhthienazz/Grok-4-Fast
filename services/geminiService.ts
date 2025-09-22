
import { GoogleGenAI, Chat } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

let chat: Chat | null = null;

function getChatInstance(): Chat {
  if (!chat) {
    if (!process.env.API_KEY) {
      throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are Grok, a powerful and slightly witty AI. Keep your responses concise and helpful.',
      },
    });
  }
  return chat;
}

export async function sendMessageToAI(message: string): Promise<string> {
  try {
    const chatInstance = getChatInstance();
    const response: GenerateContentResponse = await chatInstance.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    if (error instanceof Error) {
        return `An error occurred: ${error.message}. Please check your API key and network connection.`;
    }
    return "An unknown error occurred while communicating with the AI.";
  }
}
