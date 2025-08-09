export class Message {
	constructor(
		public id: string,
		public content: string,
		public role: "data" | "system" | "user" | "assistant",
		public timestamp: Date,
		public agentCalls?: AgentCalls,
	) {}
}

export type AgentCalls = {
	weather_expert?: number;
	news_expert?: number;
	supervisor?: number;
};
