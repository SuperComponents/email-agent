import { useRef, useCallback, useEffect, DependencyList } from "react";

export function useAutoScroll(dependencies?: DependencyList) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Scroll to bottom when dependencies change
  useEffect(() => {
    if (dependencies && dependencies.length > 0) {
      scrollToBottom();
    }
  }, [scrollToBottom, ...(dependencies || [])]);

  return { messagesEndRef, scrollToBottom };
}
