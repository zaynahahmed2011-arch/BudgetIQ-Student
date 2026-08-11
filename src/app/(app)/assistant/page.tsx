import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai";
import { ChatWindow } from "@/components/assistant/chat-window";

export default async function AssistantPage() {
  const session = await auth();
  const userId = session!.user.id;

  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 40,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Your personal financial coach, grounded in your real numbers.
        </p>
      </div>

      <ChatWindow
        initialMessages={history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
        aiConfigured={isAiConfigured()}
      />
    </div>
  );
}
