"use server";

import { ChatGroq } from "@langchain/groq";
import { env } from "@/config";

export async function createModel() {
	return new ChatGroq({
		model: "llama3-8b-8192",
		apiKey: env.GROQ_API_KEY,
	});
}
