import { useState } from "react";
import { Textarea } from "@/components/textarea/Textarea";
import { Button } from "@/components/button/Button";
import { PaperPlaneTilt, Stop } from "@phosphor-icons/react";

interface InputAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent, options?: any) => void;
  pendingToolCallConfirmation: boolean;
  isLoading: boolean;
  stop: () => void;
}

export function InputArea({
  value,
  onChange,
  onSubmit,
  pendingToolCallConfirmation,
  isLoading,
  stop,
}: InputAreaProps) {
  const [textareaHeight, setTextareaHeight] = useState("auto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, {
      data: {
        annotations: {
          hello: "world",
        },
      },
    });
    setTextareaHeight("auto"); // Reset height after submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    // Auto-resize the textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    setTextareaHeight(`${e.target.scrollHeight}px`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
      setTextareaHeight("auto"); // Reset height on Enter submission
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-4 glass absolute bottom-0 left-0 right-0 z-10 border-t border-white/10"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Textarea
            disabled={pendingToolCallConfirmation}
            placeholder={
              pendingToolCallConfirmation
                ? "Please respond to the tool confirmation above..."
                : "Send a message..."
            }
            className="premium-input flex w-full border border-neutral-200/50 dark:border-neutral-700/50 px-4 py-3 ring-offset-background placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base pb-12 backdrop-blur-sm"
            value={value}
            aria-label="Message input"
            aria-required="true"
            aria-invalid={false}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{ height: textareaHeight }}
          />
          <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:scale-110 active:scale-95 rounded-full p-2 h-fit glow"
                aria-label="Stop generation"
              >
                <Stop size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-to-r from-primary to-ai-purple text-white hover:shadow-xl hover:scale-110 active:scale-95 rounded-full p-2 h-fit glow"
                disabled={pendingToolCallConfirmation || !value.trim()}
                aria-label="Send message"
              >
                <PaperPlaneTilt size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
