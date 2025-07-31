"use server";

import { HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import { Agent } from "@/lib/langgraph/agent";
import { createModel } from "@/lib/langgraph/model";

const model = await createModel();
const agent = new Agent(model);

export async function POST(request: Request) {
	const data = await request.json();
	const app = agent.createPersistentGraph();

	const result = await app.invoke(
		{
			messages: [new HumanMessage(data.message)],
		},
		{ configurable: { thread_id: "123" }, streamMode: "values" as const },
	);

	const lastMessage = result.messages.at(-1);
	return NextResponse.json({ message: lastMessage?.toJSON() });
}
