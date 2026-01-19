"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SparklesIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chat from "./chat";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB button - shown when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="fab-button"
            className="fixed right-4 bottom-10 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              size="lg"
              className="h-12 gap-2 rounded-full px-4 shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <SparklesIcon className="size-5" />
              <span className="font-medium">Need Help?</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel - always mounted to preserve state */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.95,
          y: isOpen ? 0 : 20,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-background border-border fixed right-4 bottom-4 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border shadow-2xl sm:h-[700px] sm:w-[450px]"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        {/* Header */}
        <div className="border-border bg-muted/50 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="text-primary size-5" />
            <span className="font-semibold">Math Tutor</span>
          </div>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsOpen(false)}>
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          <Chat />
        </div>
      </motion.div>
    </>
  );
}
