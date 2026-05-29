"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const AI_CHIPS = [
  "Create employee",
  "Show active employees",
  "Generate summary",
  "Deactivate employee",
];

export default function DashboardChatWidget() {
  const router = useRouter();
  const [input, setInput] = useState("");

  function openChat() {
    router.push("/dashboard/chat");
  }

  return (
    <Card className="w-80 shrink-0 gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2 border-b px-4 py-3">
        <Bot className="text-primary h-5 w-5" />
        <h2 className="font-semibold">AI Assistant</h2>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <p className="text-muted-foreground mt-8 text-center text-xs">
          Ask me anything about your employees or HR tasks.
        </p>
      </CardContent>

      <CardFooter className="flex-col items-start p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {AI_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={openChat}
              className="hover:bg-accent rounded-full border px-2.5 py-0.5 text-xs transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex w-full items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && openChat()}
            placeholder="Type your command..."
            className="bg-background focus:ring-ring flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
          />
          <button
            onClick={openChat}
            className="bg-primary rounded-lg p-2 text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
