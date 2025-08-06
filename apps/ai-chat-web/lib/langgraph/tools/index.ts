import { ToolNode } from "@langchain/langgraph/prebuilt";
import { searchTool } from "./search.tool";
import { weatherTool } from "./weather.tool";

export const weatherTools = [weatherTool];
export const searchTools = [searchTool];

export const weatherToolNode = new ToolNode(weatherTools);
export const searchToolNode = new ToolNode(searchTools);
