import { Event } from "./types";

export function prettyPrint(events: Event[]) {
  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  };

  const formatEvent = (event: Event) => {
    const timestamp = formatDate(event.timestamp);

    switch (event.type) {
      case "email_received":
        return `${timestamp} - Customer sent email: "${event.data.subject}"\n${event.data.body}`;

      case "search-knowledge-base":
        const resultsCount = event.data.result?.length || 0;
        return `${timestamp} - Agent searched the knowledge base (${resultsCount} results found)`;

      case "summarize_useful_context":
        const summary = event.data.args?.summary;
        const keyPoints = event.data.args?.key_points || [];
        const recommendedActions = event.data.args?.recommended_actions || [];
        
        let summaryText = `${timestamp} - Agent summarized useful context:\n${summary}`;
        
        if (keyPoints.length > 0) {
          summaryText += `\n\nKey Points:\n${keyPoints.map((point: string) => `• ${point}`).join('\n')}`;
        }
        
        if (recommendedActions.length > 0) {
          summaryText += `\n\nRecommended Actions:\n${recommendedActions.map((action: string) => `• ${action}`).join('\n')}`;
        }
        
        return summaryText;

      case "update_thread_urgency":
        const urgency = event.data.args?.urgency || event.data.result?.new_urgency;
        return `${timestamp} - Agent updated thread urgency to ${urgency}`;

      case "update_thread_category":
        const category = event.data.args?.category || event.data.result?.new_category;
        return `${timestamp} - Agent updated thread category to ${category}`;

      case "compose-draft":
        return ""; // Don't show anything for compose draft

      case "finalize_draft":
        const draft = event.data.result?.final_draft || event.data.args?.draft;
        return `${timestamp} - Agent wrote this draft:\n${draft}`;

      case "user_action_needed":
        const reason = event.data.args?.reason || event.data.result?.reason;
        return `${timestamp} - Agent flagged that user action is needed: ${reason}`;

      case "reply_sent":
        return `${timestamp} - Support person sent reply`;

      case "urgency_updated":
        return `${timestamp} - Support person updated urgency to ${event.data.urgency}`;

      case "category_updated":
        return `${timestamp} - Support person updated category to ${event.data.category}`;

      default:
        return `${timestamp} - ${event.type} (${event.actor})`;
    }
  };

  return events
    .map(formatEvent)
    .filter((line) => line.trim() !== "") // Remove empty lines (like compose_draft)
    .join("\n\n");
}
