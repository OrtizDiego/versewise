"use client";

import * as React from "react";
import { askQuestion } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Bot, FileText, Send } from "lucide-react";

interface AiAssistantProps {
  initialInput?: string;
  onVerseLinkClick: (verseRef: string) => void;
}

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export function AiAssistant({ initialInput, onVerseLinkClick }: AiAssistantProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  React.useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const response = await askQuestion({ question: input });
    setIsLoading(false);

    if (!response) {
      toast({
        title: "AI Error",
        description: "Received an empty response from the AI service. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
      return;
    }

    if ('error' in response) {
      toast({
        title: "AI Error",
        description: response.error,
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1)); // Remove the user message on error
    } else {
      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer ?? "I could not find an answer.",
        sources: response.sourceFiles,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

  const parseContent = (content: string) => {
    const verseRegex = /(\b(?:[1-3]\s)?[A-Za-z]+(?:\s[A-Za-z]+)?\s\d{1,3}:\d{1,3}(?:-\d{1,3})?\b)/g;
    return content.split(verseRegex).map((part, index) => {
      if (part.match(verseRegex)) {
        return (
          <button
            key={index}
            onClick={() => onVerseLinkClick(part)}
            className="text-primary font-semibold hover:underline"
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col gap-4 p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground pt-12">
                <Bot className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold font-headline">AI Assistant</h3>
                <p className="text-sm">Ask any theological question.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="size-8 border">
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                      <Bot className="size-5" />
                    </div>
                  </Avatar>
                )}
                <div className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                  }`}>
                  <p className="font-body text-sm leading-relaxed">{parseContent(message.content)}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-xs font-semibold mb-1">Sources:</h4>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs bg-background rounded-full px-2 py-0.5 border">
                            <FileText className="size-3" />
                            <span>{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="size-8">
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="size-8 border">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    <Bot className="size-5" />
                  </div>
                </Avatar>
                <div className="rounded-lg p-3 bg-secondary">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-0"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-card">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
