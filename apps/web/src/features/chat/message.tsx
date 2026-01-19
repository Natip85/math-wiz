"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

type MessageRole = "user" | "assistant";

interface MessageContextValue {
  role: MessageRole;
}

const MessageContext = React.createContext<MessageContextValue | undefined>(undefined);

function useMessageContext() {
  const context = React.useContext(MessageContext);
  if (!context) {
    throw new Error("Message components must be used within a Message");
  }
  return context;
}

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: MessageRole;
  children: React.ReactNode;
}

export function Message({ from, children, className, ...props }: MessageProps) {
  return (
    <MessageContext.Provider value={{ role: from }}>
      <div
        className={cn("flex gap-3", from === "user" ? "flex-row-reverse" : "flex-row", className)}
        {...props}
      >
        <MessageAvatar />
        {children}
      </div>
    </MessageContext.Provider>
  );
}

type MessageAvatarProps = React.HTMLAttributes<HTMLDivElement>;

export function MessageAvatar({ className, ...props }: MessageAvatarProps) {
  const { role } = useMessageContext();

  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)} {...props}>
      <AvatarFallback
        className={cn(
          role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}

interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MessageContent({ children, className, ...props }: MessageContentProps) {
  const { role } = useMessageContext();

  return (
    <div
      className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
        role === "user"
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-muted text-foreground rounded-bl-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
