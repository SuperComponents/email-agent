// ProResponse Agent - Support Agent Assistant LLM
// Assists support people by gathering relevant context and drafting responses

export { assistSupportPerson, AgentResponse } from './agent';
export { openai } from './openaiClient';

// Example usage:
// import { assistSupportPerson } from 'proresponse-agent';
// 
// const response = await assistSupportPerson(
//   "Customer email text here",
//   "Additional context from support person"
// );
// 
// console.log('Reasoning:', response.reasoning);
// console.log('Draft:', response.draft); 