"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@clarion/ui";
import { useChatHistory, useSendChatMessage } from "@/hooks/use-api";
import { useParams, usePathname } from "next/navigation";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  metadata?: { sourceTitles?: string[] };
}

function ChatBubble({ message, isBot }: { message: ChatMessage; isBot: boolean }) {
  const renderContent = (content: string) => {
    // Simple markdown: **text** -> <strong>text</strong>
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className={`flex gap-3 mb-4 ${isBot ? "" : "flex-row-reverse"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        isBot 
          ? "bg-clarion-navy-100 text-clarion-navy-700" 
          : "bg-clarion-amber-100 text-clarion-amber-700"
      }`}>
        {isBot ? "AI" : "ME"}
      </div>
      <div className={`max-w-[80%] ${isBot ? "" : "text-right"}`}>
        <div className={`rounded-lg px-3 py-2 text-sm ${
          isBot 
            ? "bg-gray-100 text-gray-900" 
            : "bg-clarion-navy-600 text-white"
        }`}>
          <p 
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
          />
          {isBot && message.metadata?.sourceTitles && message.metadata.sourceTitles.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Sources:</p>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {message.metadata.sourceTitles.map((title, i) => (
                  <li key={i}>{title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
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
  
  const history = historyRes?.data ?? [];
  
  // Inject complaint context when on a complaint detail page
  const complaintId = pathname.includes("/complaints/") && typeof params?.id === "string"
    ? params.id
    : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isPending) return;
    
    const messageText = message;
    setMessage("");
    
    try {
      await sendMessage({ 
        message: messageText, 
        complaintId 
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageText); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        {isOpen ? "✕" : "💬"}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl border-2 z-40 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Clarion AI Assistant
            </CardTitle>
            {complaintId && (
              <p className="text-xs text-muted-foreground">
                Context: Current complaint
              </p>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 pr-3 mb-4 overflow-y-auto" ref={scrollRef}>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">
                    👋 Hi! I'm your AI assistant
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ask me about submitting complaints, checking status, or university policies.
                  </p>
                </div>
              ) : (
                history.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isBot={msg.role === "assistant"}
                  />
                ))
              )}
              
              {/* Loading indicator */}
              {isPending && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-clarion-navy-100 flex items-center justify-center text-xs font-medium text-clarion-navy-700">
                    AI
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isPending}
                className="text-sm"
              />
              <Button 
                size="sm" 
                onClick={handleSend}
                disabled={!message.trim() || isPending}
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}