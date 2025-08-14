"use server";

import { ChatGroq } from "@langchain/groq";

export async function createModel() {
	return new ChatGroq({
		model: "llama-3.3-70b-versatile",
		apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
	});
}
