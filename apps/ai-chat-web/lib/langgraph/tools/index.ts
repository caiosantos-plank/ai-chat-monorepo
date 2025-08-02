import { ToolNode } from "@langchain/langgraph/prebuilt";
import { weatherTool } from "./weather.tool";
import { searchTool } from "./search.tool";

export const tools = new ToolNode([weatherTool, searchTool]);
