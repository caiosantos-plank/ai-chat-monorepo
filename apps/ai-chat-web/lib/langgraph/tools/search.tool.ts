import { tool } from "@langchain/core/tools";
import z from "zod";
import { NewsApiClient } from "@/lib/news-api";

const newsApiClient = new NewsApiClient();

export const searchTool = tool(
	async (input: unknown) => {
		const { query } = input as { query: string };
		console.log("search tool called with input:", query);

		const rawData = await newsApiClient.getNews(query);

		return { news: rawData };
	},
	{
		name: "get_latest_news",
		description: "Get the latest news for a given query",
		schema: z.object({
			query: z.string().describe("The query to search for"),
		}),
	},
);
