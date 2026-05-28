import { useMemo, useState, type FormEvent } from "react";
import { Bot, Loader2, Send, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { publicApi } from "../../services";
import { Button } from "../ui";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

function shouldShowAssistant(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/iocs") ||
    pathname.startsWith("/malware") ||
    pathname.startsWith("/threat-actors") ||
    pathname.startsWith("/blockchain") ||
    pathname.startsWith("/contributor") ||
    pathname.startsWith("/admin")
  );
}

function inferContextType(pathname: string): "public" | "contributor" | "admin" {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/contributor")) return "contributor";
  return "public";
}

function promptsForRoute(pathname: string) {
  if (pathname.startsWith("/iocs/")) {
    return ["Explain this IOC", "Why was this marked false positive?", "How do I verify this on blockchain?"];
  }
  if (pathname.startsWith("/malware/")) {
    return ["Explain this malware", "What are key malware capabilities?", "How should beginners interpret this record?"];
  }
  if (pathname.startsWith("/threat-actors/")) {
    return ["Explain this threat actor", "What does this motivation mean?", "What should analysts watch for?"];
  }
  if (pathname.startsWith("/blockchain")) {
    return ["Explain blockchain verification", "What does false positive mean on-chain?", "How to read lifecycle history?"];
  }
  return ["Explain trust score simply", "What is TLP GREEN vs WHITE?", "How to report a false positive?"];
}

export function FloatingAssistant() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I can explain ThreatChain concepts, IOCs, malware, threat actors, trust score, and blockchain verification in simple terms.",
    },
  ]);

  const quickPrompts = useMemo(() => promptsForRoute(pathname), [pathname]);

  if (!shouldShowAssistant(pathname)) {
    return null;
  }

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const payload = {
        message: trimmed,
        context_type: inferContextType(pathname),
      } as const;
      const response = await publicApi.sendChatMessage(payload);
      const assistantContent = response.response || response.answer || "No response received.";
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
        },
      ]);
    } catch (caughtError) {
      const messageText =
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "Assistant is unavailable right now.";
      setError(messageText);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: "I couldn't answer right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 rounded-full px-4 shadow-lg"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-4 w-4" />
          Assistant
        </Button>
      ) : (
        <div className="w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] text-[var(--color-card-fg)] shadow-2xl transition-all duration-200">
          <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#4A3CC9]" />
              <p className="text-sm font-semibold">ThreatChain Assistant</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Collapse assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 p-3">
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-6 rounded-lg bg-[#4A3CC9] px-3 py-2 text-sm text-white"
                      : "mr-6 rounded-lg bg-[#EEF1FA] px-3 py-2 text-sm text-[#100A36] dark:bg-[#1A1A2E] dark:text-[#E0E0ED]"
                  }
                >
                  {message.content}
                </div>
              ))}
              {isLoading ? (
                <div className="mr-6 flex items-center gap-2 rounded-lg bg-[#EEF1FA] px-3 py-2 text-sm text-[#100A36] dark:bg-[#1A1A2E] dark:text-[#E0E0ED]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-[var(--color-border-strong)] px-2.5 py-1 text-xs text-[var(--color-text-muted)] transition hover:bg-[#EEF1FA] dark:hover:bg-[#1A1A2E]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {error ? (
              <p className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] px-2.5 py-2 text-xs text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                {error}
              </p>
            ) : null}

            <form className="flex items-end gap-2" onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a cybersecurity question..."
                rows={2}
                className="min-h-[56px] flex-1 resize-none rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-input-fg)] outline-none transition focus:border-[#4A3CC9] focus:ring-2 focus:ring-[#4A3CC9]/20"
              />
              <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
