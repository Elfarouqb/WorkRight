import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Send, Trash2, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useChat } from '@/hooks/useChat';
import { AiAvatar } from '@/components/chat/AiAvatar';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  "Ik ben ontslagen en weet niet waarom",
  "Wat telt als discriminatie?",
  "Hoeveel tijd heb ik?",
  "Wat doet Het Juridisch Loket?",
];

const Hulp = () => {
  // Voice assistant state
  const {
    isListening,
    isProcessing,
    isSpeaking,
    messages: voiceMessages,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    stopSpeaking,
    clearMessages: clearVoiceMessages,
  } = useVoiceAssistant();

  // Text chat state
  const [input, setInput] = useState('');
  const { messages: chatMessages, isLoading, error: chatError, sendMessage, clearMessages: clearChatMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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

  const isVoiceActive = isListening || isProcessing || isSpeaking;

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
            Kies hoe je hulp wilt krijgen: spraak of tekst
          </p>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 max-w-6xl mx-auto">
          {/* Left Panel - Voice Assistant */}
          <div className="lg:border-r lg:border-border lg:pr-6">
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden h-[600px] flex flex-col">
              {/* Voice Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    isVoiceActive ? "bg-primary animate-pulse" : "bg-muted-foreground"
                  )} />
                  <span className="font-heading font-semibold text-foreground">Spraakassistent</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearVoiceMessages}
                  disabled={voiceMessages.length === 0}
                  className="h-8 w-8"
                  aria-label="Wis gesprek"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Voice Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {voiceMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 space-y-4">
                    {/* AI Avatar */}
                    <div className="flex justify-center mb-4">
                      <AiAvatar 
                        isListening={isListening} 
                        isProcessing={isProcessing} 
                        isSpeaking={isSpeaking}
                        size="lg"
                      />
                    </div>
                    <p className="text-lg font-medium">Hoi, ik ben Mira</p>
                    <p className="text-sm opacity-75">
                      Druk op de microfoon knop en stel je vraag
                    </p>
                    <p className="text-xs opacity-60">
                      Je kunt ook zeggen: "Ga naar tijdlijn" om te navigeren
                    </p>
                  </div>
                ) : (
                  voiceMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex items-start gap-2",
                        msg.role === 'user' ? "flex-row-reverse" : ""
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <AiAvatar 
                          isSpeaking={index === voiceMessages.length - 1 && isSpeaking}
                          size="sm" 
                          className="shrink-0 mt-1"
                        />
                      )}
                      <div
                        className={cn(
                          "p-4 rounded-xl max-w-[80%]",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground border border-border/50"
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="space-y-2">
                            {msg.content.split('\n').map((line, i) => {
                              if (line.startsWith('•')) {
                                return (
                                  <p key={i} className="text-sm pl-2 border-l-2 border-primary/30">
                                    {line.substring(1).trim()}
                                  </p>
                                );
                              }
                              if (line.includes(':') && !line.startsWith('http')) {
                                const [label, ...rest] = line.split(':');
                                return (
                                  <p key={i} className="text-sm">
                                    <span className="font-semibold text-primary">{label}:</span>
                                    {rest.join(':')}
                                  </p>
                                );
                              }
                              return line.trim() ? (
                                <p key={i} className="text-sm">{line}</p>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
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

                {/* Speaking indicator with stop button */}
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 text-sm text-muted-foreground bg-accent/10 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                      <span>Aan het spreken...</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopSpeaking}
                      className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                    >
                      <VolumeX className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  </motion.div>
                )}

                {/* Error */}
                {voiceError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-xl text-sm bg-destructive/20 text-destructive"
                  >
                    {voiceError}
                  </motion.div>
                )}
              </div>

              {/* Voice Controls */}
              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={handleToggleListening}
                    disabled={isProcessing || isSpeaking}
                    size="lg"
                    className={cn(
                      "h-20 w-20 rounded-full transition-all duration-300",
                      isListening 
                        ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                        : "bg-primary hover:bg-primary/90"
                    )}
                    aria-label={isListening ? "Stop met luisteren" : "Begin met luisteren"}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {isListening 
                    ? "Ik luister... Druk nogmaals om te stoppen" 
                    : "Druk om te spreken"}
                </p>
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
                  onClick={clearChatMessages}
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
                    className="shrink-0 w-12 h-12 rounded-xl"
                    aria-label="Verstuur bericht"
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hulp;
