import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  "I was let go and I'm not sure why",
  "What counts as discrimination?",
  "How much time do I have?",
  "What is ACAS?",
];

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (question: string) => {
    if (isLoading) return;
    sendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-24 right-6 z-50",
              "w-[calc(100vw-3rem)] max-w-md h-[500px] max-h-[70vh]",
              "bg-card border border-border rounded-2xl shadow-card",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div>
                <h3 className="font-heading font-semibold text-foreground">
                  Rights Assistant
                </h3>
                <p className="text-xs text-muted-foreground">
                  Here to help, not to judge
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                disabled={messages.length === 0}
                aria-label="Clear chat"
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="py-4 space-y-4">
                  {/* Welcome message */}
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Heart className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-foreground text-sm leading-relaxed">
                          Hello. I'm here to help you understand what happened at work. Take your time - there's no rush.
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          You can ask me anything. I won't judge, and everything you share stays private.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested questions */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Not sure where to start? Try one of these:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestedQuestions.map((question, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(question)}
                          disabled={isLoading}
                          className={cn(
                            "px-3 py-2 text-xs rounded-full",
                            "bg-muted hover:bg-muted/80 text-foreground",
                            "border border-border hover:border-primary/30",
                            "transition-colors duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl leading-relaxed",
                      "text-sm sm:text-base",
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-destructive/10 rounded-xl p-4 text-center"
                >
                  <p className="text-foreground text-sm mb-2">
                    Something went wrong, but that's okay. These things happen.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(messages[messages.length - 1]?.content || '')}
                    className="text-sm"
                  >
                    Try again
                  </Button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's on your mind?"
                  className={cn(
                    "flex-1 resize-none rounded-xl px-4 py-3",
                    "bg-muted text-foreground placeholder:text-muted-foreground",
                    "border-0 focus:ring-2 focus:ring-ring focus:outline-none",
                    "text-sm sm:text-base min-h-[48px] max-h-[120px]"
                  )}
                  rows={1}
                  disabled={isLoading}
                  aria-label="Type your question or describe what happened"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 w-12 h-12 rounded-xl"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                I'm here to help you understand - not to give legal advice.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
