import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import ChatWindow from "./ChatWindow";

export default async function ChatPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const dbUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {},
    create: { email: user.email! },
  });

  const rawMessages = await prisma.chatMessage.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "asc" },
  });

  const initialMessages = rawMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    action: msg.action ?? undefined,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <ChatWindow initialMessages={initialMessages} />
    </div>
  );
}
