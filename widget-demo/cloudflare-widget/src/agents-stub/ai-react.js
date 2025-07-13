// Stub for agents/ai-react that connects to a backend API
import { useState, useCallback } from 'react';

export const useAgentChat = ({ agent, maxSteps }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e, options) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      parts: [{ type: 'text', text: input }],
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get API URL from widget config
      const apiUrl = window.widgetConfig?.apiUrl || 'http://localhost:3001';
      
      // Send message to your backend
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          maxSteps,
          ...options?.data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        parts: [{ type: 'text', text: '' }],
        createdAt: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);

        // OpenAI streams Server-Sent Events: sequences that start with "data: ..."\n\n
        const events = chunkStr.split("\n\n");
        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;

          const data = line.replace(/^data:\s*/, "");
          if (data === "[DONE]") {
            reader.cancel();
            break;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            const textDelta = delta?.content ?? "";
            if (textDelta) {
              assistantMessage.content += textDelta;
              assistantMessage.parts[0].text += textDelta;
            }
          } catch (err) {
            // If JSON.parse fails, fallback to raw text
            assistantMessage.content += data;
            assistantMessage.parts[0].text += data;
          }
        }
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...assistantMessage };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        parts: [{ type: 'text', text: 'Sorry, I encountered an error. Please try again.' }],
        createdAt: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, maxSteps]);

  const addToolResult = useCallback((result) => {
    // Handle tool results if needed
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    addToolResult,
    clearHistory,
    isLoading,
    stop
  };
}; 