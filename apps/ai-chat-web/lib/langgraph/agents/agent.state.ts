import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
	...MessagesAnnotation.spec,
	goingTo: Annotation<string[]>({
		reducer: (x, y) => y,
	}),
	agentCalls: Annotation<Record<string, number>>({
		reducer: (x, y) => ({ ...x, ...y }),
	}),
	summary: Annotation<string>({
		reducer: (_, action) => action,
		default: () => "",
	}),
	recordings: Annotation<File[]>({
		reducer: (x, y) => [...y],
		default: () => [],
	}),
});
