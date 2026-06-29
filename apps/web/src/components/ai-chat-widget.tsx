"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Input } from "@clarion/ui";
import { useChatHistory, useSendChatMessage } from "@/hooks/use-api";
import { useParams, usePathname } from "next/navigation";
import { Sparkles, User, Send, X, ArrowUpRight, MessageSquare } from "lucide-react";
import { cn } from "@clarion/ui";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  metadata?: { sourceTitles?: string[] };
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

function ChatBubble({ message, isBot }: { message: ChatMessage; isBot: boolean }) {
  return (
    <div className={cn("flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-150", !isBot && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold mt-0.5",
        isBot
          ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/[0.07] dark:bg-[#111113] dark:text-slate-400"
          : "border-clarion-amber-200/60 bg-clarion-amber-50 text-clarion-amber-700 dark:border-clarion-amber-900/40 dark:bg-clarion-amber-500/10 dark:text-clarion-amber-400"
      )}>
        {isBot ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[78%] flex flex-col gap-1", isBot ? "items-start" : "items-end")}>
        <div className={cn(
          "rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
          isBot
            ? "rounded-tl-sm border border-slate-100 bg-slate-50 text-slate-800 dark:border-white/[0.07] dark:bg-[#111113] dark:text-slate-200"
            : "rounded-tr-sm bg-slate-700 text-white dark:bg-slate-700"
        )}>
          <p
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
          {isBot && message.metadata?.sourceTitles && message.metadata.sourceTitles.length > 0 && (
            <div className="mt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                <ArrowUpRight className="h-2.5 w-2.5" /> Sources
              </p>
              <ul className="space-y-0.5">
                {message.metadata.sourceTitles.map((title, i) => (
                  <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]" title={title}>
                    · {title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="text-[10px] font-medium text-slate-300 dark:text-slate-600 uppercase tracking-wider px-0.5">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/[0.07] dark:bg-[#111113]">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-xl rounded-tl-sm border border-slate-100 bg-slate-50 dark:border-white/[0.07] dark:bg-[#111113] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const params = useParams();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: historyRes } = useChatHistory();
  const { mutateAsync: sendMessage, isPending } = useSendChatMessage();

  const history = useMemo(() => (historyRes?.data ?? []) as ChatMessage[], [historyRes?.data]);

  const complaintId =
    pathname.includes("/complaints/") && typeof params?.id === "string" ? params.id : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen, isPending]);

  const handleSend = async () => {
    if (!message.trim() || isPending) return;
    const text = message;
    setMessage("");
    try {
      await sendMessage({ message: text, complaintId });
    } catch {
      setMessage(text);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 cursor-pointer",
          "bg-slate-700 text-white dark:bg-slate-700",
          "hover:shadow-xl hover:-translate-y-0.5 active:scale-95",
          "border border-slate-700/50 dark:border-slate-700/50"
        )}
        style={{ height: "3.25rem", width: "3.25rem" }}
      >
        {isOpen ? (
          <X className="h-5 w-5 transition-transform duration-150" />
        ) : (
          <Sparkles className="h-5 w-5 text-clarion-amber-400" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-40 flex flex-col rounded-2xl shadow-2xl overflow-hidden",
            "w-[350px] md:w-[380px] h-[520px]",
            "bg-white dark:bg-[#111113]",
            "border border-slate-200 dark:border-white/[0.07]",
            "animate-in slide-in-from-bottom-4 fade-in duration-200 ease-out"
          )}
          role="dialog"
          aria-label="AI Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.07] bg-slate-50/60 dark:bg-[#111113]/50 px-5 py-3.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 dark:bg-slate-700 text-clarion-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-none">Clarion Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-500">Online · AI-powered</p>
                </div>
              </div>
            </div>
            {complaintId && (
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-md">
                Context: Complaint
              </span>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4 border border-slate-200 dark:border-slate-700">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">How can I help?</h4>
                <p className="mt-1.5 text-[12.5px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[200px]">
                  Ask about complaint status, resolution steps, or institution guidelines.
                </p>
              </div>
            ) : (
              <>
                {history.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} isBot={msg.role === "assistant"} />
                ))}
                {isPending && <TypingIndicator />}
              </>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#111113] px-4 py-3 shrink-0">
            <Input
              placeholder="Ask a question…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={isPending}
              className="flex-1 text-sm rounded-xl border-slate-200 dark:border-slate-700"
              aria-label="Chat message"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isPending}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150 cursor-pointer",
                message.trim() && !isPending
                  ? "bg-slate-700 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-700 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
