"use server";

import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

export async function createModel() {
	return new ChatGroq({
		model: "llama-3.3-70b-versatile",
		apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
		temperature: 0.5,
	});
}

// export async function createModel() {
// 	return new ChatOpenAI({
// 		model: "gpt-4o",
// 		apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY,
// 	});
// }
