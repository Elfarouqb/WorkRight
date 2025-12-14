import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Trash2, Loader2, Heart, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/useChat';
import { useSendTranscript } from '@/hooks/useSendTranscript';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  "Ik ben ontslagen en weet niet waarom",
  "Wat telt als discriminatie?",
  "Hoeveel tijd heb ik?",
  "Wat doet Het Juridisch Loket?",
];

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [hasSentTranscript, setHasSentTranscript] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const { sendTranscript, isLoading: isSendingTranscript } = useSendTranscript();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesCountRef = useRef(0);

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

  // Convert messages to transcript text
  const getTranscriptText = useCallback(() => {
    return messages.map(msg => {
      const role = msg.role === 'user' ? 'Gebruiker' : 'Assistent';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
  }, [messages]);

  // Send transcript with email
  const doSendTranscript = useCallback(async (email: string) => {
    if (messages.length === 0 || hasSentTranscript) return;

    const transcript = getTranscriptText();
    const userName = user?.user_metadata?.display_name || email.split('@')[0] || '';

    console.log('Sending transcript to:', email || '(no email)');

    await sendTranscript({
      transcript,
      email,
      name: userName,
    });

    setHasSentTranscript(true);
    setEmailSent(true);
  }, [messages, hasSentTranscript, getTranscriptText, sendTranscript, user]);

  // Track message count to detect new conversations
  useEffect(() => {
    if (messages.length > 0 && messagesCountRef.current === 0) {
      // New conversation started, reset flags
      setHasSentTranscript(false);
      setShowEmailPrompt(false);
      setEmailSent(false);
      setGuestEmail('');
    }
    messagesCountRef.current = messages.length;
  }, [messages.length]);

  // Handle closing the chat
  const handleClose = useCallback(() => {
    if (messages.length > 0 && !hasSentTranscript) {
      if (user?.email) {
        // Logged in user: auto-send with their email
        doSendTranscript(user.email);
        setIsOpen(false);
      } else {
        // Guest: show email prompt
        setShowEmailPrompt(true);
      }
    } else {
      setIsOpen(false);
    }
  }, [messages.length, hasSentTranscript, user, doSendTranscript]);

  // Handle guest email submit
  const handleGuestEmailSubmit = async () => {
    if (guestEmail.trim()) {
      await doSendTranscript(guestEmail.trim());
    }
    setShowEmailPrompt(false);
    setIsOpen(false);
  };

  // Handle skip (no email)
  const handleSkipEmail = () => {
    setShowEmailPrompt(false);
    setIsOpen(false);
  };

  const handleClearMessages = () => {
    clearMessages();
    setHasSentTranscript(false);
    setShowEmailPrompt(false);
    setEmailSent(false);
    setGuestEmail('');
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
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
                  Rechten Assistent
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hier om te helpen, niet te oordelen
                </p>
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearMessages}
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
                          Hallo. Ik ben hier om je te helpen begrijpen wat er op je werk is gebeurd. Neem je tijd - er is geen haast.
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Je kunt me alles vragen. Ik oordeel niet, en alles wat je deelt blijft privé.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested questions */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Weet je niet waar je moet beginnen? Probeer een van deze:
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
                    "flex gap-2",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-border">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face" 
                        alt="Assistent"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl leading-relaxed",
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
                    Er ging iets mis, maar dat geeft niet. Dit kan gebeuren.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(messages[messages.length - 1]?.content || '')}
                    className="text-sm"
                  >
                    Probeer opnieuw
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
                  placeholder="Wat houdt je bezig?"
                  className={cn(
                    "flex-1 resize-none rounded-xl px-4 py-3",
                    "bg-muted text-foreground placeholder:text-muted-foreground",
                    "border-0 focus:ring-2 focus:ring-ring focus:outline-none",
                    "text-sm sm:text-base min-h-[48px] max-h-[120px]"
                  )}
                  rows={1}
                  disabled={isLoading}
                  aria-label="Typ je vraag of beschrijf wat er is gebeurd"
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
                Ik help je te begrijpen - dit is geen juridisch advies.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email prompt for guests */}
      <AnimatePresence>
        {showEmailPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={handleSkipEmail}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Samenvatting ontvangen?</h3>
                  <p className="text-xs text-muted-foreground">Per e-mail, helemaal gratis</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Wil je een overzichtelijke samenvatting van dit gesprek ontvangen? Vul je e-mailadres in en we sturen het naar je toe.
              </p>

              <div className="space-y-3">
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="je@email.nl"
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-sm",
                    "bg-muted text-foreground placeholder:text-muted-foreground",
                    "border border-border focus:ring-2 focus:ring-ring focus:outline-none"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && guestEmail.trim()) {
                      handleGuestEmailSubmit();
                    }
                  }}
                  autoFocus
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSkipEmail}
                  >
                    Nee, bedankt
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleGuestEmailSubmit}
                    disabled={!guestEmail.trim() || isSendingTranscript}
                  >
                    {isSendingTranscript ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Verstuur'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
