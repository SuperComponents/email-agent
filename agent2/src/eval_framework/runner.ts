/**
 * The main eval runner.
 */

import { ContextGenerator } from "../context/context";
import ToolManager, { ToolDefinition } from "../context/tools";
import { LLMClient, LLMResponse, ToolCallSchema } from "../llm";
import { Event } from "../types";
import { z } from "zod";




export interface EvalScenario {
    model: LLMClient;
    contextGenerator: new (eventLog: Event[], toolManager: ToolManager) => ContextGenerator;
    
}
export interface EvalTest {
    name: string;
    events: Event[];
    tools: ToolDefinition[];
    expectedToolCall: z.infer<typeof ToolCallSchema>; 
}

interface EvalResult {
    test: EvalTest;
    model: LLMClient;
    contextGenerator: new (eventLog: Event[], toolManager: ToolManager) => ContextGenerator;
    response: z.infer<typeof ToolCallSchema>; 
    success: boolean;
}

interface ScenarioResult {
    model: LLMClient;
    contextGenerator: new (eventLog: Event[], toolManager: ToolManager) => ContextGenerator;
    results: EvalResult[];
    
}

async function runTest(scenario: EvalScenario, test: EvalTest): Promise<EvalResult> {
    // Create a ToolManager from the test tools
    const toolManager = new ToolManager();
    test.tools.forEach(tool => toolManager.registerTool(tool));
    
    // Create the context generator instance
    const contextGenerator = new scenario.contextGenerator(test.events, toolManager);
    
    const result = await scenario.model.getNextToolCall(contextGenerator.getSystemPrompt(), contextGenerator.getMessage()); 

    function checkCorrectTool(toolCall: z.infer<typeof ToolCallSchema>, expectedToolCall: z.infer<typeof ToolCallSchema>) {
        return toolCall.name === expectedToolCall.name;
    }
    function checkCorrectArgKeys(toolCall: z.infer<typeof ToolCallSchema>, expectedToolCall: z.infer<typeof ToolCallSchema>) {
        let setExpected = new Set(Object.keys(expectedToolCall.args))
        
        for (const key of Object.keys(toolCall.args)) {
            if (!setExpected.has(key)) {
                return false;
            }
        }

        return true;
    }
    function checkExactArgs(toolCall: z.infer<typeof ToolCallSchema>, expectedToolCall: z.infer<typeof ToolCallSchema>) {
        return JSON.stringify(toolCall.args) === JSON.stringify(expectedToolCall.args);
    }

    const isCorrectTool = checkCorrectTool(result.tool_call, test.expectedToolCall);
    const isCorrectArgKeys = checkCorrectArgKeys(result.tool_call, test.expectedToolCall);
    const isExactArgs = checkExactArgs(result.tool_call, test.expectedToolCall);


    let temp: EvalResult = {
        test,
        model: scenario.model,
        contextGenerator: scenario.contextGenerator,
        response: result.tool_call,
        success: isCorrectTool && isCorrectArgKeys 
    }
    console.log(`${temp.test.name} ${temp.success ? '✅' : '❌'}`);
    if(!temp.success) {
        console.log(`Response: ${JSON.stringify(temp.response)}`);
        console.log(`Expected: ${JSON.stringify(temp.test.expectedToolCall)}`);
    }
    return temp;
}




export default async function runEvals(scenarios: EvalScenario[], tests: EvalTest[]) {

    const scenarioResults: ScenarioResult[] = [];
    for (const scenario of scenarios) {
        console.log('---------STARTING SCENARIO------------');
        console.log(`Model: ${scenario.model.model}`);
        console.log(`Context Generator: ${scenario.contextGenerator.name}`);
        console.log(`--------------------------------`);
        const results: EvalResult[] = await Promise.all(tests.map(test => runTest(scenario, test)));

        
        console.log(`--------------------------------`);
        const successCount = results.filter(result => result.success).length;
        console.log(`Model: ${scenario.model.model}`);
        console.log(`Context Generator: ${scenario.contextGenerator.name}`);
        console.log(`Results: ${successCount}/${results.length} tests passed`);
        console.log(`---------ENDING SCENARIO------------`);
        scenarioResults.push({
            model: scenario.model,
            contextGenerator: scenario.contextGenerator,
            results
        });
    }

    

}


