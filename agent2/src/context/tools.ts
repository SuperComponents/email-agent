import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";


export abstract class ToolDefinition {
    abstract name: string;
    abstract description: string;
    abstract args: z.ZodSchema;
    abstract result: z.ZodSchema;
    abstract execute(args: any): Promise<any>;


    
}

/**
 * This class is responsible for managign the LLM
 */
export default class ToolManager {
    private toolList: ToolDefinition[] = [];
    registerTool(tool: ToolDefinition) {
        this.toolList.push(tool);
    }

    getToolList(): string[] {
        return this.toolList.map(tool => tool.name);
    }

    listTools(): ToolDefinition[] {
        return [...this.toolList];
    }

    getTool(name: string): ToolDefinition | undefined {
        return this.toolList.find(tool => tool.name === name);
    }

    
}


