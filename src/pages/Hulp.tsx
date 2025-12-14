import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, Trash2, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useChat } from '@/hooks/useChat';
import { useSendTranscript } from '@/hooks/useSendTranscript';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AiAvatar } from '@/components/chat/AiAvatar';
import { AnamAvatar } from '@/components/chat/AnamAvatar';
import { cn } from '@/lib/utils';

const Hulp = () => {
  const { t } = useLanguage();
  
  const suggestedQuestions = [
    t.hulpQ1,
    t.hulpQ2,
    t.hulpQ3,
    t.hulpQ4,
  ];

  // Text chat state
  const [input, setInput] = useState('');
  const { messages: chatMessages, isLoading, error: chatError, sendMessage, clearMessages: clearChatMessages } = useChat();
  const { sendTranscript, isLoading: isSendingTranscript } = useSendTranscript();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Transcript state
  const [hasSentTranscript, setHasSentTranscript] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const messagesCountRef = useRef(0);

  // Scroll only within the chat container, not the whole page
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Scroll when messages change OR when loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading, scrollToBottom]);

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

    const result = await sendTranscript({
      transcript,
      email,
      name: userName,
    });

    if (result.ok) {
      toast({
        title: "Samenvatting verzonden",
        description: email ? `We sturen een samenvatting naar ${email}` : "Je samenvatting wordt verwerkt",
      });
    }

    setHasSentTranscript(true);
  }, [chatMessages, hasSentTranscript, getTranscriptText, sendTranscript, user, toast]);

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
            {t.hulpTitle}
          </h1>
          <p className="text-muted-foreground">
            {t.hulpSubtitle}
          </p>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Video Avatar with Steps */}
          <div className="lg:pr-4">
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden h-[650px] flex flex-col">
              {/* Avatar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-heading font-semibold text-foreground">{t.hulpVideoAssistant}</span>
                </div>
              </div>

              {/* Anam Video Avatar with Steps below */}
              <div className="flex-1 overflow-hidden p-4">
                <AnamAvatar 
                  onMessage={(msg) => {
                    console.log('Anam message:', msg);
                  }}
                  className="h-full"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Text Chat */}
          <div className="lg:pl-4">
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden h-[650px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-heading font-semibold text-foreground">{t.hulpTextChat}</span>
                    <p className="text-xs text-muted-foreground">
                      {t.hulpChatSubtitle}
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
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="py-4 space-y-4">
                    {/* Welcome message */}
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <AiAvatar size="sm" className="shrink-0" />
                        <div className="space-y-2">
                          <p className="text-foreground text-sm leading-relaxed">
                            <span className="font-semibold">{t.hulpWelcome}</span> {t.hulpWelcomeDesc}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {t.hulpChatSubtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Suggested questions */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center">
                        {t.hulpSuggestionIntro}
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
                      <span className="text-sm text-muted-foreground">{t.hulpThinking}</span>
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
                      {t.hulpErrorMessage}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(chatMessages[chatMessages.length - 1]?.content || '')}
                      className="text-sm"
                    >
                      {t.hulpTryAgain}
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
                    placeholder={t.hulpInputPlaceholder}
                    className={cn(
                      "flex-1 resize-none rounded-xl px-4 py-3",
                      "bg-muted text-foreground placeholder:text-muted-foreground",
                      "border-0 focus:ring-2 focus:ring-ring focus:outline-none",
                      "text-sm min-h-[48px] max-h-[120px]"
                    )}
                    rows={1}
                    disabled={isLoading}
                    aria-label={t.hulpInputPlaceholder}
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

        {/* Disclaimer and Human Signposting */}
        <div className="mt-8 max-w-3xl mx-auto space-y-4">
          {/* Legal Disclaimer */}
          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <p className="text-sm text-foreground font-medium mb-2">
              {t.hulpDisclaimerTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.hulpDisclaimerDesc}
            </p>
          </div>

          {/* Human Signposting */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-sm text-foreground font-medium mb-3">
              {t.hulpHumanTitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a 
                href="tel:0900-8020" 
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <span className="font-semibold">Het Juridisch Loket:</span> 0900-8020 (gratis)
              </a>
              <a 
                href="https://www.mensenrechten.nl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <span className="font-semibold">Mensenrechten:</span> mensenrechten.nl
              </a>
              <a 
                href="https://www.fnv.nl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <span className="font-semibold">Vakbond FNV:</span> fnv.nl
              </a>
              <a 
                href="https://www.uwv.nl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <span className="font-semibold">UWV:</span> uwv.nl
              </a>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-center text-xs text-muted-foreground">
            {t.hulpPrivacyNote}
          </p>
        </div>
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
                  <h3 className="font-semibold text-foreground">{t.hulpSummaryTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t.hulpSummaryQuestion}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {t.hulpSummaryDesc}
              </p>

              <div className="space-y-3">
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder={t.hulpEmailPlaceholder}
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
                    {t.hulpNoThanks}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleGuestEmailSubmit}
                    disabled={!guestEmail.trim() || isSendingTranscript}
                  >
                    {isSendingTranscript ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t.hulpSend
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
