import {
	Annotation,
	StateGraph,
	MemorySaver,
	START,
	END,
} from "@langchain/langgraph";
import type {
	AIMessage,
	BaseMessage,
	SystemMessage,
} from "@langchain/core/messages";
import type { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

const AgentState = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (x, y) => x.concat(y),
	}),
});

export class Agent {
	private memorySaver = new MemorySaver();
	private systemPrompt: SystemMessage;

	constructor(
		private model: ChatOpenAI,
		systemPrompt: SystemMessage,
	) {
		this.model = model;
		this.systemPrompt = systemPrompt;
	}

	private shouldContinue(
		state: typeof AgentState.State,
	): "action" | typeof END {
		const lastMessage = state.messages[state.messages.length - 1];
		// If there is no function call, then we finish
		if (lastMessage && !(lastMessage as AIMessage).tool_calls?.length) {
			return END;
		}
		// Otherwise if there is, we continue
		// return "action";
		return END;
	}

	private invokeModel = async (state: typeof AgentState.State) => {
		const response = await this.model.invoke(
			[this.systemPrompt, ...state.messages],
			{},
		);

		return {
			messages: [response],
		};
	};

	public createPersistentGraph = () => {
		const graph = new StateGraph(AgentState);

		graph
			.addNode("agent", this.invokeModel)
			.addConditionalEdges("agent", this.shouldContinue)
			.addEdge(START, "agent");

		const app = graph.compile({
			checkpointer: this.memorySaver,
		});

		return app;
	};
}
