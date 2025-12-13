import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

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
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Ask me anything about UK employment rights, dismissal, or discrimination.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    I'm here to help you understand, not to give legal advice.
                  </p>
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
                      "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
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
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-2"
                >
                  <p className="text-destructive text-sm">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendMessage(messages[messages.length - 1]?.content || '')}
                    className="mt-1 text-xs"
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
                  placeholder="Type your question..."
                  className={cn(
                    "flex-1 resize-none rounded-xl px-4 py-3",
                    "bg-muted text-foreground placeholder:text-muted-foreground",
                    "border-0 focus:ring-2 focus:ring-ring focus:outline-none",
                    "text-sm min-h-[44px] max-h-[120px]"
                  )}
                  rows={1}
                  disabled={isLoading}
                  aria-label="Type your message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 w-11 h-11 rounded-xl"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This is guidance only, not legal advice.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
