import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, Trash2, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useChat } from '@/hooks/useChat';
import { useSendTranscript } from '@/hooks/useSendTranscript';
import { useAuth } from '@/contexts/AuthContext';
import { AiAvatar } from '@/components/chat/AiAvatar';
import { AnamAvatar } from '@/components/chat/AnamAvatar';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  "Ik ben ontslagen en weet niet waarom",
  "Wat telt als discriminatie?",
  "Hoeveel tijd heb ik?",
  "Wat doet Het Juridisch Loket?",
];

const Hulp = () => {
  // Text chat state
  const [input, setInput] = useState('');
  const { messages: chatMessages, isLoading, error: chatError, sendMessage, clearMessages: clearChatMessages } = useChat();
  const { sendTranscript, isLoading: isSendingTranscript } = useSendTranscript();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Transcript state
  const [hasSentTranscript, setHasSentTranscript] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const messagesCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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
    return chatMessages.map(msg => {
      const role = msg.role === 'user' ? 'Gebruiker' : 'Assistent';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
  }, [chatMessages]);

  // Send transcript with email
  const doSendTranscript = useCallback(async (email: string) => {
    if (chatMessages.length === 0 || hasSentTranscript) return;

    const transcript = getTranscriptText();
    const userName = user?.user_metadata?.display_name || email.split('@')[0] || '';

    console.log('Sending transcript to:', email || '(no email)');

    await sendTranscript({
      transcript,
      email,
      name: userName,
    });

    setHasSentTranscript(true);
  }, [chatMessages, hasSentTranscript, getTranscriptText, sendTranscript, user]);

  // Track message count to detect new conversations
  useEffect(() => {
    if (chatMessages.length > 0 && messagesCountRef.current === 0) {
      setHasSentTranscript(false);
      setShowEmailPrompt(false);
      setGuestEmail('');
    }
    messagesCountRef.current = chatMessages.length;
  }, [chatMessages.length]);

  // Handle page unload - send transcript
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (chatMessages.length > 0 && !hasSentTranscript && user?.email) {
        // Try to send for logged in users
        const transcript = getTranscriptText();
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-transcript`,
          JSON.stringify({
            transcript,
            email: user.email,
            name: user.user_metadata?.display_name || '',
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [chatMessages, hasSentTranscript, user, getTranscriptText]);

  // Handle guest email submit
  const handleGuestEmailSubmit = async () => {
    if (guestEmail.trim()) {
      await doSendTranscript(guestEmail.trim());
    }
    setShowEmailPrompt(false);
  };

  // Handle skip (no email)
  const handleSkipEmail = () => {
    setShowEmailPrompt(false);
  };

  // Trigger email prompt for guests when they have messages
  const handleClearWithTranscript = () => {
    if (chatMessages.length > 0 && !hasSentTranscript) {
      if (user?.email) {
        doSendTranscript(user.email);
      } else {
        setShowEmailPrompt(true);
        return; // Don't clear yet
      }
    }
    clearChatMessages();
    setHasSentTranscript(false);
    setGuestEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Hulp & Ondersteuning
          </h1>
          <p className="text-muted-foreground">
            Kies hoe je hulp wilt krijgen: video of tekst
          </p>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 max-w-6xl mx-auto">
          {/* Left Panel - Video Avatar */}
          <div className="lg:border-r lg:border-border lg:pr-6">
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden h-[600px] flex flex-col">
              {/* Avatar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-heading font-semibold text-foreground">Video Assistent</span>
                </div>
              </div>

              {/* Anam Video Avatar */}
              <div className="flex-1 flex items-center justify-center p-4">
                <AnamAvatar 
                  onMessage={(msg) => {
                    console.log('Anam message:', msg);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Divider for large screens */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-px bg-border" />

          {/* Right Panel - Text Chat */}
          <div className="lg:pl-6">
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-heading font-semibold text-foreground">Tekst Chat</span>
                    <p className="text-xs text-muted-foreground">
                      Hier om te helpen, niet te oordelen
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearWithTranscript}
                  disabled={chatMessages.length === 0}
                  className="h-8 w-8"
                  aria-label="Wis gesprek"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="py-4 space-y-4">
                    {/* Welcome message */}
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <AiAvatar size="sm" className="shrink-0" />
                        <div className="space-y-2">
                          <p className="text-foreground text-sm leading-relaxed">
                            <span className="font-semibold">Hoi, ik ben Mira.</span> Ik ben hier om je te helpen begrijpen wat er op je werk is gebeurd. Neem je tijd - er is geen haast.
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

                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-start gap-2",
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <AiAvatar 
                        size="sm" 
                        className="shrink-0 mt-1"
                      />
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-3 rounded-2xl leading-relaxed",
                        "text-sm",
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && chatMessages[chatMessages.length - 1]?.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2"
                  >
                    <AiAvatar isProcessing size="sm" className="shrink-0 mt-1" />
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Even denken...</span>
                    </div>
                  </motion.div>
                )}

                {chatError && (
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
                      onClick={() => sendMessage(chatMessages[chatMessages.length - 1]?.content || '')}
                      className="text-sm"
                    >
                      Probeer opnieuw
                    </Button>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
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
                      "text-sm min-h-[48px] max-h-[120px]"
                    )}
                    rows={1}
                    disabled={isLoading}
                    aria-label="Typ je vraag of beschrijf wat er is gebeurd"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-12 w-12 rounded-xl shrink-0"
                    aria-label="Verstuur bericht"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          Je privacy is belangrijk. Alles wat je deelt blijft vertrouwelijk en wordt alleen gebruikt om je te helpen. 
          We geven geen juridisch advies - we helpen je voorbereiden op gesprekken met professionals.
        </p>
      </main>

      <Footer />

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
    </div>
  );
};

export default Hulp;
