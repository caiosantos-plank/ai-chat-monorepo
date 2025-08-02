import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { OpenWeatherApiClient } from "@/lib/open-weather";

const openWeatherApiClient = new OpenWeatherApiClient();

export const weatherTool = tool(
	async (input: unknown) => {
		const { location } = input as { location: string };
		console.log("Weather tool called with input:", location);

		const rawData = await openWeatherApiClient.getWeather(location);
		const data = {
			...rawData,
			temperature: `${rawData.temperature}°C`,
			wind_speed: `${rawData.wind_speed} km/h`,
		};

		console.log("Weather tool called with input:", location, data);
		return data;
	},
	{
		name: "get_weather",
		description: "Get the weather in a given location",
		schema: z.object({
			location: z.string().describe("The location to get the weather for"),
		}),
	},
);
