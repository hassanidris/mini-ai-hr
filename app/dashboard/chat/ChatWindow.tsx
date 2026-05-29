"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
};

const ACTION_LABELS: Record<string, string> = {
  create_employee: "Employee Created",
  update_employee: "Employee Updated",
  deactivate_employee: "Employee Deactivated",
};

const SUGGESTION_CHIPS = [
  "List all active employees",
  "Show me all departments",
  "Create a new employee",
];

export default function ChatWindow({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    // Optimistically append the user message right away
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || data.errorMessage) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.errorMessage ?? "Something went wrong. Please try again.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            action: data.action,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="bg-card flex min-h-150 flex-1 flex-col rounded-xl border shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 border-b px-5 py-3.5">
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
          <Bot className="text-primary h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">AI HR Assistant</h1>
          <p className="text-muted-foreground text-xs">Powered by Gemini</p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              <Bot className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <p className="font-medium">How can I help you today?</p>
              <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                I can list, create, update, or deactivate employees — just ask.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id ?? i}
            className={cn(
              "flex gap-3",
              msg.role === "user" && "flex-row-reverse",
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "flex max-w-[75%] flex-col gap-1",
                msg.role === "user" && "items-end",
              )}
            >
              {msg.action && ACTION_LABELS[msg.action] && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ {ACTION_LABELS[msg.action]}
                </span>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm",
                )}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              <span className="text-muted-foreground text-xs">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="border-t p-4">
        {/* Suggestion chips */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => sendMessage(chip)}
              disabled={isLoading}
              className="hover:bg-accent rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something about your employees…"
            disabled={isLoading}
            className="bg-background focus:ring-ring flex-1 rounded-xl border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
