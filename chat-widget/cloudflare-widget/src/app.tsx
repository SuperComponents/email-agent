import { useState } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "agents/ai-react";
import type { tools } from "./tools";
import { useTheme } from "./hooks/useTheme";

// Component imports
import { InputArea } from "@/components/chat/InputArea";
import { MessageArea } from "@/components/chat/MessageArea";
import { WidgetHeader } from "@/components/chat/WidgetHeader";
import type { Message } from "@/types/Message";

// List of tools that require human confirmation
// NOTE: this should match the keys in the executions object in tools.ts
const toolsRequiringConfirmation: (keyof typeof tools)[] = [
  "getWeatherInformation",
];

export default function Chat() {
  const { theme, toggleTheme } = useTheme();
  const [showDebug, setShowDebug] = useState(false);

  const handleCloseWidget = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "CLOSE_WIDGET" }, "*");
    }
  };

  const agent = useAgent({
    agent: "chat",
  });

  const {
    messages: agentMessages,
    input: agentInput,
    handleInputChange: handleAgentInputChange,
    handleSubmit: handleAgentSubmit,
    addToolResult,
    clearHistory,
    isLoading,
    stop,
  } = useAgentChat({
    agent,
    maxSteps: 5,
  });

  const pendingToolCallConfirmation = agentMessages.some((m: Message) =>
    m.parts?.some(
      (part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation.state === "call" &&
        toolsRequiringConfirmation.includes(
          part.toolInvocation.toolName as keyof typeof tools
        )
    )
  );

  return (
    <div className="h-[100vh] w-full p-2 sm:p-4 flex justify-center items-center gradient-bg overflow-hidden">
      <div className="widget-container h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] w-full mx-auto max-w-lg flex flex-col rounded-2xl overflow-hidden relative backdrop-blur-xl" role="main" aria-label="ProResponse AI Chat Widget">
        <WidgetHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          showDebug={showDebug}
          onToggleDebug={() => setShowDebug((prev) => !prev)}
          onClear={clearHistory}
          onClose={handleCloseWidget}
        />

        {/* Messages */}
        <MessageArea
          messages={agentMessages}
          isLoading={isLoading}
          showDebug={showDebug}
          addToolResult={addToolResult}
        />

        {/* Input Area */}
        <InputArea
          value={agentInput}
          onChange={handleAgentInputChange}
          onSubmit={handleAgentSubmit}
          pendingToolCallConfirmation={pendingToolCallConfirmation}
          isLoading={isLoading}
          stop={stop}
        />
      </div>
    </div>
  );
}
