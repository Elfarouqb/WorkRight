import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
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
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
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

  const toggleAudioMute = useCallback(() => {
    const audioElement = document.getElementById('anam-audio-output') as HTMLAudioElement;
    
    const newMutedState = !isAudioMuted;
    
    if (audioElement) {
      audioElement.muted = newMutedState;
      if (!newMutedState) {
        audioElement.volume = 1.0;
        audioElement.play().catch(e => console.log('Audio play error:', e));
      }
      console.log('Audio muted set to:', newMutedState);
    }
    
    setIsAudioMuted(newMutedState);
  }, [isAudioMuted]);

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
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
          >
            <Button
              size="icon"
              variant={isAudioMuted ? "destructive" : "secondary"}
              onClick={toggleAudioMute}
              className="rounded-full h-10 w-10"
              title={isAudioMuted ? "Geluid aan" : "Geluid uit"}
            >
              {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
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
              size="icon"
              variant="destructive"
              onClick={endSession}
              className="rounded-full h-10 w-10"
              title="Gesprek beëindigen"
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
