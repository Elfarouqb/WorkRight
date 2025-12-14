import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Video, Square, Mic, MicOff, Mail, Check, CircleCheck, Circle } from 'lucide-react';
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
  completed: boolean;
}

interface AnamAvatarProps {
  onMessage?: (message: Message) => void;
  className?: string;
}

const VIDEO_ELEMENT_ID = 'anam-video-element';

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
  
  // Action steps tracking - extracted from AI responses
  const [actionSteps, setActionSteps] = useState<ActionStep[]>([]);

  // Extract action steps from assistant messages
  const extractActionSteps = useCallback((content: string) => {
    // Look for actionable items in the message
    const actionPatterns = [
      /(?:je moet|je kunt|je kan|probeer|vergeet niet|belangrijk|stap \d+)[:\s]+([^.!?]+[.!?])/gi,
      /(?:→|•|➤|\d+\.)\s*([^.!?\n]+[.!?]?)/g,
    ];
    
    const newSteps: ActionStep[] = [];
    
    for (const pattern of actionPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1]?.trim();
        if (text && text.length > 10 && text.length < 100) {
          newSteps.push({
            id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: text,
            completed: false,
          });
        }
      }
    }
    
    // If we found steps, add them (max 5)
    if (newSteps.length > 0) {
      setActionSteps(prev => [...prev, ...newSteps.slice(0, 3)].slice(-5));
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
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Video container - Larger size */}
      <div className="relative w-full aspect-[3/4] max-w-[420px] rounded-2xl overflow-hidden bg-muted border border-border">
        <AnimatePresence mode="wait">
          {!isConnected && !isConnecting && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
            >
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-12 h-12 text-primary" />
              </div>
              <p className="text-xl font-medium text-foreground mb-2">Mira</p>
              <p className="text-sm text-muted-foreground mb-4">
                Jouw persoonlijke assistent
              </p>
              {error && (
                <p className="text-sm text-destructive mb-4">{error}</p>
              )}
              <Button onClick={startSession} disabled={isConnecting} size="lg">
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
              <Loader2 className="w-14 h-14 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Verbinden...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video element - always rendered but hidden when not connected */}
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
        
        {/* Separate audio element for Anam audio output */}
        <audio 
          id="anam-audio-output" 
          autoPlay 
          playsInline
          style={{ display: 'none' }}
        />

        {/* Controls overlay when connected */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3"
          >
            <Button
              size="icon"
              variant={isMicMuted ? "destructive" : "secondary"}
              onClick={toggleMicMute}
              className="rounded-full h-12 w-12"
              title={isMicMuted ? "Microfoon aan" : "Microfoon uit"}
            >
              {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            {/* Big red square STOP button */}
            <Button
              onClick={endSession}
              className="h-14 w-14 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg"
              title="Gesprek stoppen"
            >
              <Square className="h-6 w-6 fill-current" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Action steps panel - shows on the left when connected and there are steps */}
      <AnimatePresence>
        {isConnected && actionSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-0 top-0 bottom-0 w-48 bg-card/95 backdrop-blur-sm border-r border-border p-3 overflow-y-auto rounded-l-2xl"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Te doen
            </p>
            <div className="space-y-2">
              {actionSteps.map((step, i) => (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => toggleStepComplete(step.id)}
                  className={cn(
                    "w-full flex items-start gap-2 p-2 rounded-lg text-left transition-colors",
                    "hover:bg-muted/50",
                    step.completed && "opacity-60"
                  )}
                >
                  {step.completed ? (
                    <CircleCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <span className={cn(
                    "text-xs leading-snug",
                    step.completed ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {step.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      {isConnected && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Verbonden met Mira</span>
        </div>
      )}

      {/* Email prompt for guests OR confirmation for logged-in users after session ends */}
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

      {/* Success toast shown for logged-in users - handled via toast already */}
    </div>
  );
};