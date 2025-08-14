import type { AgentCalls } from "./message.entity";

export type ChatHistory = {
	id: string;
	messages: string;
	summary: string;
	agentCalls: AgentCalls;
	created_at: Date;
	updated_at: Date;
};
