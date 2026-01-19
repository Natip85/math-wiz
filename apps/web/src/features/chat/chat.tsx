"use client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { CopyIcon, GlobeIcon, RefreshCcwIcon, SparklesIcon } from "lucide-react";
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai-elements/sources";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
const models = [
  {
    name: "GPT 4o",
    value: "openai/gpt-4o",
    provider: "openai" as const,
  },
  {
    name: "Claude Sonnet 4",
    value: "anthropic/claude-sonnet-4-20250514",
    provider: "anthropic" as const,
  },
  {
    name: "Deepseek R1",
    value: "deepseek/deepseek-r1",
    provider: "deepseek" as const,
  },
  {
    name: "Gemini 2.5 Flash",
    value: "google/gemini-2.5-flash-preview-05-20",
    provider: "google" as const,
  },
];

const suggestions = [
  "Help me with multiplication tables",
  "How do I add fractions?",
  "What is the area of a rectangle?",
  "Help me solve a word problem",
];
const Chat = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const { messages, sendMessage, status, regenerate } = useChat();

  const selectedModel = models.find((m) => m.value === model) || models[0];

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      }
    );
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      { text: suggestion },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      }
    );
  };
  return (
    <div className="relative mx-auto size-full max-w-3xl p-4">
      <div className="flex h-full flex-col">
        <Conversation className="h-full">
          <ConversationContent>
            {/* Empty state with suggestions */}
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <SparklesIcon className="text-muted-foreground size-12" />
                  <h2 className="text-xl font-semibold">How can I help you today?</h2>
                  <p className="text-muted-foreground text-sm">
                    Ask me anything about math, or try one of these suggestions:
                  </p>
                </div>
                <Suggestions className="max-w-md justify-center">
                  {suggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion}
                      suggestion={suggestion}
                      onClick={handleSuggestionClick}
                    />
                  ))}
                </Suggestions>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id}>
                {/* Sources from web search */}
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url").length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={message.parts.filter((part) => part.type === "source-url").length}
                      />
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source key={`${message.id}-${i}`} href={part.url} title={part.url} />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}

                {message.parts.map((part, i) => {
                  // Handle text parts
                  if (part.type === "text") {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                        {message.role === "assistant" && (
                          <MessageActions>
                            <MessageAction onClick={() => regenerate()} label="Retry">
                              <RefreshCcwIcon className="size-3" />
                            </MessageAction>
                            <MessageAction
                              onClick={() => navigator.clipboard.writeText(part.text)}
                              label="Copy"
                            >
                              <CopyIcon className="size-3" />
                            </MessageAction>
                          </MessageActions>
                        )}
                      </Message>
                    );
                  }

                  // Handle reasoning parts
                  if (part.type === "reasoning") {
                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        className="w-full"
                        isStreaming={
                          status === "streaming" &&
                          i === message.parts.length - 1 &&
                          message.id === messages.at(-1)?.id
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  }

                  // Handle tool parts (AI SDK v6 structure)
                  if (part.type.startsWith("tool-")) {
                    const toolPart = part as {
                      type: string;
                      toolCallId: string;
                      toolName?: string;
                      state: string;
                      input?: unknown;
                      output?: unknown;
                      errorText?: string;
                    };
                    const toolName = toolPart.toolName || part.type.replace("tool-", "");

                    return (
                      <Tool key={`${message.id}-${i}`}>
                        <ToolHeader
                          title={toolName}
                          type={part.type as `tool-${string}`}
                          state={
                            toolPart.state as
                              | "input-streaming"
                              | "input-available"
                              | "output-available"
                              | "output-error"
                              | "output-denied"
                          }
                        />
                        <ToolContent>
                          <ToolInput input={toolPart.input} />
                          {(toolPart.state === "output-available" ||
                            toolPart.state === "output-error") && (
                            <ToolOutput output={toolPart.output} errorText={toolPart.errorText} />
                          )}
                        </ToolContent>
                      </Tool>
                    );
                  }

                  return null;
                })}
              </div>
            ))}

            {/* Loading state with shimmer */}
            {status === "submitted" && (
              <div className="flex items-center gap-2">
                <Loader />
                <Shimmer className="text-muted-foreground text-sm">Thinking...</Shimmer>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>

              {/* Enhanced Model Selector */}
              <ModelSelector open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ModelSelectorLogoGroup>
                      <ModelSelectorLogo provider={selectedModel.provider} />
                    </ModelSelectorLogoGroup>
                    <span className="hidden sm:inline">{selectedModel.name}</span>
                  </Button>
                </ModelSelectorTrigger>
                <ModelSelectorContent title="Select a model">
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    <ModelSelectorGroup heading="Available Models">
                      {models.map((m) => (
                        <ModelSelectorItem
                          key={m.value}
                          value={m.value}
                          onSelect={() => {
                            setModel(m.value);
                            setModelSelectorOpen(false);
                          }}
                          className="flex items-center gap-2"
                        >
                          <ModelSelectorLogoGroup>
                            <ModelSelectorLogo provider={m.provider} />
                          </ModelSelectorLogoGroup>
                          <ModelSelectorName>{m.name}</ModelSelectorName>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
export default Chat;
