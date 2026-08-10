import { prisma } from "@/lib/prisma";
import { requireUserId, errorResponse } from "@/lib/api-helpers";
import { chatMessageSchema } from "@/lib/validations";
import { chatWithAssistant, isAiConfigured } from "@/lib/ai";
import { buildFinancialContext } from "@/lib/finance-data";

export async function POST(req: Request) {
  const { userId, error } = await requireUserId();
  if (error) return error;

  if (!isAiConfigured()) {
    return errorResponse(
      "AI assistant isn't configured yet. Add ANTHROPIC_API_KEY to .env to enable it.",
      503
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { messages } = parsed.data;
  const lastUserMessage = messages[messages.length - 1];

  const context = await buildFinancialContext(userId!);
  const stream = await chatWithAssistant(messages, context);

  let fullReply = "";

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullReply += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        controller.error(e);
        return;
      }
      controller.close();

      if (lastUserMessage?.role === "user") {
        await prisma.chatMessage.createMany({
          data: [
            { userId: userId!, role: "user", content: lastUserMessage.content },
            { userId: userId!, role: "assistant", content: fullReply },
          ],
        });
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
