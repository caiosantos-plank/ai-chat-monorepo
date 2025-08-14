import type { AgentCalls } from "../types/entities";

export const getAgentName = (agentCalls: AgentCalls) => {
	const agentNames = {
		weather_expert: "Weather Expert",
		news_expert: "News Expert",
		supervisor: "Cowboy",
	};
	const filteredAgentCalls = Object.fromEntries(
		Object.entries(agentCalls).filter(([_, value]) => value > 0),
	);
	return Object.keys(filteredAgentCalls)
		.map((key) => agentNames[key as keyof AgentCalls])
		.join(", ");
};

export const getUserInitials = (name?: string, email?: string) => {
	if (name) {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
	if (email) {
		return email[0].toUpperCase();
	}
	return "U";
};
