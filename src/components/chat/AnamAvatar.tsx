import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { AnamClient } from '@anam-ai/js-sdk';

interface AnamAvatarProps {
  onMessage?: (message: { role: 'user' | 'assistant'; content: string }) => void;
  className?: string;
}

const VIDEO_ELEMENT_ID = 'anam-video-element';

export const AnamAvatar = ({ onMessage, className }: AnamAvatarProps) => {
  const anamClientRef = useRef<AnamClient | null>(null);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

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

      client.addListener('MESSAGE_HISTORY_UPDATED' as any, (messages: any[]) => {
        console.log('Message history updated:', messages);
        if (messages.length > 0 && onMessage) {
          const lastMessage = messages[messages.length - 1];
          onMessage({
            role: lastMessage.role === 'user' ? 'user' : 'assistant',
            content: lastMessage.content,
          });
        }
      });

      client.addListener('ERROR' as any, (err: any) => {
        console.error('Anam error:', err);
        setError(err.message || 'Connection error');
        setIsConnecting(false);
      });

      // Start streaming to video element by ID
      await client.streamToVideoElement(VIDEO_ELEMENT_ID);
    } catch (err) {
      console.error('Failed to start Anam session:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [onMessage]);

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
  }, []);

  const toggleMute = useCallback(() => {
    if (anamClientRef.current) {
      if (isMuted) {
        anamClientRef.current.unmuteInputAudio();
      } else {
        anamClientRef.current.muteInputAudio();
      }
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (anamClientRef.current) {
        anamClientRef.current.stopStreaming().catch(console.error);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Video container */}
      <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-2xl overflow-hidden bg-muted border border-border">
        <AnimatePresence mode="wait">
          {!isConnected && !isConnecting && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Mira</p>
              <p className="text-sm text-muted-foreground mb-4">
                Jouw persoonlijke assistent
              </p>
              {error && (
                <p className="text-sm text-destructive mb-4">{error}</p>
              )}
              <Button onClick={startSession} disabled={isConnecting}>
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
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Verbinden...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video element - always rendered but hidden when not connected */}
        <video
          id={VIDEO_ELEMENT_ID}
          autoPlay
          playsInline
          className={cn(
            "w-full h-full object-cover",
            !isConnected && "hidden"
          )}
        />

        {/* Controls overlay when connected */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          >
            <Button
              size="icon"
              variant={isMuted ? "destructive" : "secondary"}
              onClick={toggleMute}
              className="rounded-full h-10 w-10"
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={endSession}
              className="rounded-full h-10 w-10"
            >
              <VideoOff className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Status indicator */}
      {isConnected && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Verbonden met Mira</span>
        </div>
      )}
    </div>
  );
};
