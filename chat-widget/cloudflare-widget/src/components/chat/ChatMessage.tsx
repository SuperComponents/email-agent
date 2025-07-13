import { motion } from "framer-motion";
import { Avatar } from "@/components/avatar/Avatar";
import { Card } from "@/components/card/Card";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";
import type { Message } from "@/types/Message";
import type { tools } from "../../tools";

interface ChatMessageProps {
  message: Message;
  index: number;
  messages: Message[];
  showDebug: boolean;
  addToolResult: (toolCallId: string, result: any) => void;
}

// List of tools that require human confirmation
// NOTE: this should match the keys in the executions object in tools.ts
const toolsRequiringConfirmation: (keyof typeof tools)[] = [
  "getWeatherInformation",
];

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function ChatMessage({ message: m, index, messages, showDebug, addToolResult }: ChatMessageProps) {
  const isUser = m.role === "user";
  const showAvatar = index === 0 || messages[index - 1]?.role !== m.role;

  return (
    <motion.div
      key={m.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      {showDebug && (
        <pre className="text-xs text-muted-foreground overflow-scroll">
          {JSON.stringify(m, null, 2)}
        </pre>
      )}
      <div
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex gap-2 max-w-[85%] ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {showAvatar && !isUser ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Avatar username={"AI"} className="ring-2 ring-ai-purple/20" />
            </motion.div>
          ) : (
            !isUser && <div className="w-8" />
          )}

          <div>
            <div>
              {m.parts?.map((part, i) => {
                if (part.type === "text") {
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: immutable index
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        delay: i * 0.05,
                      }}
                    >
                      <Card
                        className={`p-4 rounded-2xl ${
                          isUser
                            ? "message-bubble user text-white rounded-tr-sm"
                            : "message-bubble assistant rounded-tl-sm"
                        } ${
                          part.text.startsWith("scheduled message")
                            ? "border-accent/50"
                            : ""
                        } relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                      >
                        {part.text.startsWith(
                          "scheduled message"
                        ) && (
                          <span className="absolute -top-3 -left-2 text-base">
                            🕒
                          </span>
                        )}
                        <MemoizedMarkdown
                          id={`${m.id}-${i}`}
                          content={part.text.replace(
                            /^scheduled message: /,
                            ""
                          )}
                        />
                      </Card>
                      <p
                        className={`text-xs text-muted-foreground mt-1 ${
                          isUser ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(
                          new Date(m.createdAt as unknown as string)
                        )}
                      </p>
                    </motion.div>
                  );
                }

              if (part.type === "tool-invocation") {
                const toolInvocation = part.toolInvocation;
                const toolCallId = toolInvocation.toolCallId;
                const needsConfirmation =
                  toolsRequiringConfirmation.includes(
                    toolInvocation.toolName as keyof typeof tools
                  );

                // Skip rendering the card in debug mode
                if (showDebug) return null;

                return (
                  <ToolInvocationCard
                    // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe here as the array is static
                    key={`${toolCallId}-${i}`}
                    toolInvocation={toolInvocation}
                    toolCallId={toolCallId}
                    needsConfirmation={needsConfirmation}
                    addToolResult={addToolResult}
                  />
                );
              }
              return null;
            })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
