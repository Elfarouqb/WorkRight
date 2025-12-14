import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useSendTranscript } from '@/hooks/useSendTranscript';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const VoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasSentTranscript, setHasSentTranscript] = React.useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = React.useState(false);
  const [guestEmail, setGuestEmail] = React.useState('');
  const {
    isListening,
    isProcessing,
    isSpeaking,
    messages,
    transcript,
    error,
    startListening,
    stopListening,
    clearMessages,
  } = useVoiceAssistant();
  const { sendTranscript, isLoading: isSendingTranscript } = useSendTranscript();
  const { user } = useAuth();
  const messagesCountRef = useRef(0);

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

    const transcriptText = getTranscriptText();
    const userName = user?.user_metadata?.display_name || email.split('@')[0] || '';

    console.log('Sending voice transcript to:', email || '(no email)');

    await sendTranscript({
      transcript: transcriptText,
      email,
      name: userName,
    });

    setHasSentTranscript(true);
  }, [messages, hasSentTranscript, getTranscriptText, sendTranscript, user]);

  // Track message count to detect new conversations
  useEffect(() => {
    if (messages.length > 0 && messagesCountRef.current === 0) {
      setHasSentTranscript(false);
      setShowEmailPrompt(false);
      setGuestEmail('');
    }
    messagesCountRef.current = messages.length;
  }, [messages.length]);

  // Handle closing the panel
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
    setGuestEmail('');
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isActive = isListening || isProcessing || isSpeaking;

  return (
    <>
      {/* Floating Voice Button */}
      <motion.div
        className="fixed bottom-6 right-24 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            isActive 
              ? "bg-primary animate-pulse" 
              : "bg-accent hover:bg-accent/90"
          )}
          aria-label={isOpen ? "Sluit spraakassistent" : "Open spraakassistent"}
        >
          {isSpeaking ? (
            <Volume2 className="h-6 w-6 text-accent-foreground" />
          ) : (
            <Mic className="h-6 w-6 text-accent-foreground" />
          )}
        </Button>
      </motion.div>

      {/* Voice Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 max-h-[500px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isActive ? "bg-primary animate-pulse" : "bg-muted-foreground"
                )} />
                <span className="font-semibold text-foreground">Spraakassistent</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Mic className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Druk op de microfoon knop en stel je vraag</p>
                  <p className="text-xs mt-2 opacity-75">
                    Je kunt ook zeggen: "Ga naar tijdlijn" om te navigeren
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-xl text-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground ml-8"
                        : "bg-muted text-foreground mr-8"
                    )}
                  >
                    {msg.content}
                  </motion.div>
                ))
              )}

              {/* Current transcript */}
              {isListening && transcript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl text-sm bg-primary/20 text-foreground ml-8 italic"
                >
                  {transcript}...
                </motion.div>
              )}

              {/* Processing indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 text-sm text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Even denken...</span>
                </motion.div>
              )}

              {/* Speaking indicator */}
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 text-sm text-muted-foreground"
                >
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span>Aan het spreken...</span>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl text-sm bg-destructive/20 text-destructive"
                >
                  {error}
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-center gap-4">
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearMessages}
                    className="text-xs"
                  >
                    Wis gesprek
                  </Button>
                )}
                
                <Button
                  onClick={handleToggleListening}
                  disabled={isProcessing || isSpeaking}
                  size="lg"
                  className={cn(
                    "h-14 w-14 rounded-full transition-all duration-300",
                    isListening 
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                      : "bg-primary hover:bg-primary/90"
                  )}
                  aria-label={isListening ? "Stop met luisteren" : "Begin met luisteren"}
                >
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : isListening ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-3">
                {isListening
                  ? "Ik luister... Druk nogmaals om te stoppen"
                  : "Druk om te spreken"}
              </p>
            </div>
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
