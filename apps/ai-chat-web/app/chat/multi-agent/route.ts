import { HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import { createModel } from "@/lib/langgraph/model";
import { Supervisor } from "@/lib/langgraph/supervisor.multiagent";

const model = await createModel();
const agent = new Supervisor(model);

export async function POST(request: Request) {
	const { message } = await request.json();

	const response = await agent.graph.invoke(
		{
			messages: [new HumanMessage(message)],
		},
		{ configurable: { thread_id: "123" }, streamMode: "values" as const },
	);

	const lastMessage = response.messages.at(-1);

	return NextResponse.json({ message: lastMessage });
}
