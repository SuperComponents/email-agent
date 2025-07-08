## Project overview

A support agent assistant LLM. Assist the support person by gathering relevant context and drafting a response.


Name: proresponse ai

## Nomenclature:
- Agent: the llm agent that uses tools to assist the support person
- Support person: a human that oversees the agent and approves and refines output.

## user stories
1. A solo founder connects their support@company.com email to proresponse.ai by authenticating with google oauth
2. A support person logs in to review the emails from their customers. For each thread the proresponse agent has read the email, gathered related context, and drafted a response.
3. A customer writes an email to support@company.com telling the team they did a good job, the agent drafts a simple response that says thank you
4. A customer writes an email to support@company.com outlining a bug they are experiencing, the agent flags the case and adds an urgent tag to it and suggests workarounds from the knowledgebase
5. A customer writes an email to support@company.com asking a question about the product or service. The agent queries the knowledge base to answer the question and draft a response.
6. A customer writes an email to support@company.com asking for changes to be made to their account. The agent leaves a note to the support person that action is needed.

## out of scope
- Google OAuth, initial version will use mock email and knowledgebase data
- connecting to slack or other 3rd party services

## Future scope
- If the information does not exist in the knowledge base then the agent will flag missing information in the knowledge base.


## Tables

- inboxes
- users
- threads
- emails
- drafts
- contacts
- customers


## Techstack

- Frontend: React, vite, tailwind, shadcn for components
- Backend: Typescript, drizzle, sqlite
- Agent: OpenAI


## user flows
- onboarding: user connects their email, the agent then pulls all past emails from their account and indexes and learns from them. 

## Initial screens

Login / Auth screen: email/password auth. Have this be mocked (login button signs in directly)

Initial onboarding – inbox connection flow: step-by-step wizard to add a new inbox, choose provider (mock/Google), grant OAuth consent, confirm connection success

Thread list (conversation list) screen: displays email threads for inbox with filters (all, unread, flagged, assigned to me, urgent, awaiting customer, closed)

Thread detail screen:
    - left side has list of threads in a sidebar
    - center has the email threads floating, inspired by superhuman app. Oldest on top, newest on bottom. Scrolled to the bottom.
    - right side has the agent tool history, this is inspired by the cursor IDE agent. This shows what tool calls were used and the agents conversational analysis. 
    





