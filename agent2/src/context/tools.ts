import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";


export abstract class ToolDefinition {
    abstract name: string;
    abstract description: string;
    abstract args: z.ZodSchema;
    abstract result: z.ZodSchema;
    abstract execute(args: any): Promise<any>;


    serialize(): string {
        // Convert zod schemas to standard JSON-Schema so the LLM receives a fully
        // machine-readable contract instead of the opaque `.toString()` output.
        const argsSchema = zodToJsonSchema(this.args, "args");
        const resultSchema = zodToJsonSchema(this.result, "result");

        return JSON.stringify(
            {
                name: this.name,
                description: this.description,
                args: argsSchema,
                result: resultSchema,
            },
            null,
            undefined,
        );
    }
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

    getTool(name: string): ToolDefinition | undefined {
        return this.toolList.find(tool => tool.name === name);
    }

    serialize(): string {
        return this.toolList.map(tool => tool.serialize()).join('\n');
    }
}


