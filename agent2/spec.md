This agent will run in a worker thread.

It should have 2 core commands from the outside:
- start
- stop


The agent will communicate with the main server using callbacks which do the following:
- Get event state
- Update event state


The agent will use the event space to run a basic agentic loop that follows:

1. Call get event state
2. Derive input context from event log
3. Call LLM with context to get resulting tool call (as a json response)
4. Execute tool call
5. Call update event state with tool call and tool call result 
6. Repeat steps 2-5 until stopping criteria or interupted by stop command


## Tools
- search_knowledge_base
- read_knowledge_base
- summarize_useful_context - produces a summary of relevant context for human understanding.
- update_thread_urgency
- update_thread_category
- compose_draft - provides all of the gathered context to another LLM to cleanly write a response.
- user_action_needed
- finalize_draft


## Event state
This is made up of actions and tool calls. Actions come from the user or external systems. Tool calls come from the LLM.

User actions may include:
- Thread started
- Reply sent
- Reply recieved
- User updated urgency
- User updated category
- User edited draft


## Context from events
We convert the events to LLM context according to a variety of factors. This can be thought of as a reducer that turns the events into agent context for determining the next tool call.


