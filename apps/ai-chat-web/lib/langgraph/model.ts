"use server";

import { ChatGroq } from "@langchain/groq";

export async function createModel() {
	return new ChatGroq({
		model: "llama3-8b-8192",
		apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
	});
}
