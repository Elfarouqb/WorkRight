import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Video, Square, Mic, MicOff, Mail, CircleCheck, Circle, ExternalLink, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSendTranscript } from '@/hooks/useSendTranscript';
import { useToast } from '@/hooks/use-toast';
import type { AnamClient } from '@anam-ai/js-sdk';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ActionStep {
  id: string;
  text: string;
  link?: string;
  linkLabel?: string;
  completed: boolean;
  stepNumber: number;
}

interface AnamAvatarProps {
  onMessage?: (message: Message) => void;
  className?: string;
}

const VIDEO_ELEMENT_ID = 'anam-video-element';

// Predefined helpful resources
const RESOURCES = {
  loket: { label: 'Het Juridisch Loket', url: 'tel:0900-8020', icon: 'phone' },
  mensenrechten: { label: 'College Mensenrechten', url: 'https://www.mensenrechten.nl', icon: 'link' },
  uwv: { label: 'UWV', url: 'https://www.uwv.nl', icon: 'link' },
  fnv: { label: 'FNV Vakbond', url: 'https://www.fnv.nl', icon: 'link' },
  cnv: { label: 'CNV Vakbond', url: 'https://www.cnv.nl', icon: 'link' },
};

export const AnamAvatar = ({ onMessage, className }: AnamAvatarProps) => {
  const anamClientRef = useRef<AnamClient | null>(null);
  const { user } = useAuth();
  const { sendTranscript } = useSendTranscript();
  const { toast } = useToast();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Message tracking for transcript
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [hasSentTranscript, setHasSentTranscript] = useState(false);
  
  // Action steps tracking
  const [actionSteps, setActionSteps] = useState<ActionStep[]>([]);
  const stepCounterRef = useRef(0);

  // Extract action steps from assistant messages with better pattern matching
  const extractActionSteps = useCallback((content: string) => {
    const newSteps: ActionStep[] = [];
    
    // Detect mentions of resources and create steps
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('juridisch loket') || contentLower.includes('0900-8020')) {
      stepCounterRef.current++;
      newSteps.push({
        id: `step-${Date.now()}-loket`,
        text: 'Bel Het Juridisch Loket (gratis)',
        link: 'tel:0900-8020',
        linkLabel: '0900-8020',
        completed: false,
        stepNumber: stepCounterRef.current,
      });
    }
    
    if (contentLower.includes('mensenrechten') || contentLower.includes('college')) {
      stepCounterRef.current++;
      newSteps.push({
        id: `step-${Date.now()}-mensenrechten`,
        text: 'Meld discriminatie',
        link: 'https://www.mensenrechten.nl',
        linkLabel: 'mensenrechten.nl',
        completed: false,
        stepNumber: stepCounterRef.current,
      });
    }
    
    if (contentLower.includes('uwv') || contentLower.includes('ww-uitkering') || contentLower.includes('werkloosheid')) {
      stepCounterRef.current++;
      newSteps.push({
        id: `step-${Date.now()}-uwv`,
        text: 'Vraag WW aan bij UWV',
        link: 'https://www.uwv.nl',
        linkLabel: 'uwv.nl',
        completed: false,
        stepNumber: stepCounterRef.current,
      });
    }
    
    if (contentLower.includes('vakbond') || contentLower.includes('fnv') || contentLower.includes('cnv')) {
      stepCounterRef.current++;
      newSteps.push({
        id: `step-${Date.now()}-vakbond`,
        text: 'Neem contact op met je vakbond',
        link: 'https://www.fnv.nl',
        linkLabel: 'fnv.nl',
        completed: false,
        stepNumber: stepCounterRef.current,
      });
    }
    
    if (contentLower.includes('bewijs') || contentLower.includes('documenteer') || contentLower.includes('verzamel')) {
      stepCounterRef.current++;
      newSteps.push({
        id: `step-${Date.now()}-bewijs`,
        text: 'Verzamel bewijs (emails, documenten)',
        completed: false,
        stepNumber: stepCounterRef.current,
      });
    }
    
    if (contentLower.includes('termijn') || contentLower.includes('deadline') || contentLower.includes('2 maanden') || contentLower.includes('6 maanden')) {
      stepCounterRef.current++;
      newSteps.push({
        id: `step-${Date.now()}-termijn`,
        text: 'Let op je termijnen!',
        link: '/termijnen',
        linkLabel: 'Bekijk termijnen',
        completed: false,
        stepNumber: stepCounterRef.current,
      });
    }
    
    // Add new steps, avoiding duplicates
    if (newSteps.length > 0) {
      setActionSteps(prev => {
        const existingTexts = new Set(prev.map(s => s.text));
        const uniqueNewSteps = newSteps.filter(s => !existingTexts.has(s.text));
        return [...prev, ...uniqueNewSteps].slice(-6);
      });
    }
  }, []);

  // Get transcript text
  const getTranscriptText = useCallback(() => {
    return messages.map(msg => {
      const role = msg.role === 'user' ? 'Gebruiker' : 'Assistent';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
  }, [messages]);

  // Send transcript
  const doSendTranscript = useCallback(async (email: string) => {
    if (messages.length === 0 || hasSentTranscript) return;

    const transcript = getTranscriptText();
    const userName = user?.user_metadata?.display_name || email.split('@')[0] || '';

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
  }, [messages, hasSentTranscript, getTranscriptText, sendTranscript, user, toast]);

  // Toggle step completion
  const toggleStepComplete = useCallback((stepId: string) => {
    setActionSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  }, []);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setMessages([]);
    setHasSentTranscript(false);
    setActionSteps([]);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get session token from edge function
      const { data, error: fnError } = await supabase.functions.invoke('anam-session');
      
      if (fnError || !data?.sessionToken) {
        throw new Error(fnError?.message || 'Failed to get session token');
      }

      console.log('Got Anam session token, initializing client...');

      // Dynamically import the Anam SDK
      const { createClient } = await import('@anam-ai/js-sdk');
      
      // Create the Anam client
      const client = createClient(data.sessionToken);
      anamClientRef.current = client;

      // Set up event listeners using addListener
      client.addListener('SESSION_READY' as any, () => {
        console.log('Anam session ready');
        setIsConnected(true);
        setIsConnecting(false);
      });

      client.addListener('SESSION_ENDED' as any, () => {
        console.log('Anam session ended');
        setIsConnected(false);
      });

      client.addListener('MESSAGE_HISTORY_UPDATED' as any, (messageHistory: any[]) => {
        console.log('Message history updated:', messageHistory);
        if (messageHistory.length > 0) {
          const lastMessage = messageHistory[messageHistory.length - 1];
          const newMsg: Message = {
            role: lastMessage.role === 'user' ? 'user' : 'assistant',
            content: lastMessage.content,
          };
          
          setMessages(prev => [...prev, newMsg]);
          onMessage?.(newMsg);
          
          // Extract action steps from assistant messages
          if (newMsg.role === 'assistant') {
            extractActionSteps(newMsg.content);
          }
        }
      });

      client.addListener('ERROR' as any, (err: any) => {
        console.error('Anam error:', err);
        setError(err.message || 'Connection error');
        setIsConnecting(false);
      });

      // Use client.stream() for full control over video and audio
      const streams = await client.stream();
      console.log('Got streams from Anam, count:', streams.length);
      
      // streams is an array - first stream contains video and audio
      const mediaStream = streams[0];
      if (!mediaStream) {
        throw new Error('No media stream received from Anam');
      }
      
      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();
      console.log('Video tracks:', videoTracks.length);
      console.log('Audio tracks:', audioTracks.length);
      
      const videoElement = document.getElementById(VIDEO_ELEMENT_ID) as HTMLVideoElement;
      const audioElement = document.getElementById('anam-audio-output') as HTMLAudioElement;
      
      if (videoElement) {
        // Set the full stream to video element
        videoElement.srcObject = mediaStream;
        videoElement.muted = true; // Mute video to prevent echo, audio comes from separate element
        
        try {
          await videoElement.play();
          console.log('Video element playing');
        } catch (e) {
          console.log('Video autoplay issue:', e);
        }
      }
      
      if (audioElement && audioTracks.length > 0) {
        // Create a separate stream with only audio tracks for the audio element
        const audioOnlyStream = new MediaStream(audioTracks);
        audioElement.srcObject = audioOnlyStream;
        audioElement.muted = false;
        audioElement.volume = 1.0;
        
        console.log('Audio element srcObject set');
        console.log('Audio element muted:', audioElement.muted);
        console.log('Audio element volume:', audioElement.volume);
        
        try {
          await audioElement.play();
          console.log('Audio element playing successfully');
        } catch (e) {
          console.log('Audio autoplay issue:', e);
        }
      } else {
        console.log('No audio element or no audio tracks found');
      }
    } catch (err) {
      console.error('Failed to start Anam session:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [onMessage, extractActionSteps]);

  const endSession = useCallback(async () => {
    if (anamClientRef.current) {
      try {
        await anamClientRef.current.stopStreaming();
      } catch (err) {
        console.error('Error stopping stream:', err);
      }
      anamClientRef.current = null;
    }
    setIsConnected(false);
    
    // Send transcript when session ends
    if (messages.length > 0 && !hasSentTranscript) {
      if (user?.email) {
        await doSendTranscript(user.email);
      } else {
        setShowEmailPrompt(true);
      }
    }
  }, [messages, hasSentTranscript, user, doSendTranscript]);

  const toggleMicMute = useCallback(() => {
    if (anamClientRef.current) {
      if (isMicMuted) {
        anamClientRef.current.unmuteInputAudio();
      } else {
        anamClientRef.current.muteInputAudio();
      }
      setIsMicMuted(!isMicMuted);
    }
  }, [isMicMuted]);

  // Handle guest email submit
  const handleGuestEmailSubmit = async () => {
    if (guestEmail.trim()) {
      await doSendTranscript(guestEmail.trim());
    }
    setShowEmailPrompt(false);
    setGuestEmail('');
  };

  // Handle skip email
  const handleSkipEmail = () => {
    setShowEmailPrompt(false);
    setGuestEmail('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (anamClientRef.current) {
        anamClientRef.current.stopStreaming().catch(console.error);
      }
    };
  }, []);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Compact Video container */}
      <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
        <AnimatePresence mode="wait">
          {!isConnected && !isConnecting && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">Mira</p>
              <p className="text-xs text-muted-foreground mb-3">
                Jouw persoonlijke assistent
              </p>
              {error && (
                <p className="text-xs text-destructive mb-3">{error}</p>
              )}
              <Button onClick={startSession} disabled={isConnecting} size="default">
                Start gesprek
              </Button>
            </motion.div>
          )}

          {isConnecting && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Verbinden...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video element */}
        <video
          id={VIDEO_ELEMENT_ID}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            !isConnected && "hidden"
          )}
        />
        
        {/* Audio element */}
        <audio 
          id="anam-audio-output" 
          autoPlay 
          playsInline
          style={{ display: 'none' }}
        />

        {/* Controls overlay */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2"
          >
            <Button
              size="icon"
              variant={isMicMuted ? "destructive" : "secondary"}
              onClick={toggleMicMute}
              className="rounded-full h-10 w-10"
              title={isMicMuted ? "Microfoon aan" : "Microfoon uit"}
            >
              {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              onClick={endSession}
              className="h-12 w-12 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg"
              title="Gesprek stoppen"
            >
              <Square className="h-5 w-5 fill-current" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Status indicator */}
      {isConnected && (
        <div className="flex items-center justify-center gap-2 mt-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Verbonden met Mira</span>
        </div>
      )}

      {/* Action Steps Panel - Below video */}
      <AnimatePresence>
        {actionSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 flex-1 overflow-y-auto"
          >
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                📋 Jouw stappenplan
              </p>
              <div className="space-y-2">
                {actionSteps.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-colors",
                      "bg-background border border-border",
                      step.completed && "opacity-60"
                    )}
                  >
                    <button
                      onClick={() => toggleStepComplete(step.id)}
                      className="shrink-0 mt-0.5"
                    >
                      {step.completed ? (
                        <CircleCheck className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Stap {step.stepNumber}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm mt-1",
                        step.completed ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {step.text}
                      </p>
                      {step.link && (
                        <a
                          href={step.link}
                          target={step.link.startsWith('http') ? '_blank' : undefined}
                          rel={step.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline font-medium"
                        >
                          {step.link.startsWith('tel:') ? (
                            <Phone className="w-3 h-3" />
                          ) : (
                            <ExternalLink className="w-3 h-3" />
                          )}
                          {step.linkLabel || step.link}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when connected but no steps yet */}
      {isConnected && actionSteps.length === 0 && (
        <div className="mt-4 flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center px-4">
            Vertel me wat er is gebeurd. Ik maak een stappenplan voor je.
          </p>
        </div>
      )}

      {/* Email prompt modal */}
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
                Wil je een overzichtelijke samenvatting van dit gesprek ontvangen?
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
                    disabled={!guestEmail.trim()}
                  >
                    Verstuur
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