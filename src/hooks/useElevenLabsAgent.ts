import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Message = { role: 'user' | 'assistant'; content: string };

export const useElevenLabsAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      setError(null);
      toast({
        title: 'Verbonden',
        description: 'Spraakassistent is klaar. Je kunt nu praten.',
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
    },
    onMessage: (message: unknown) => {
      console.log('Received message:', message);
      
      const msg = message as Record<string, unknown>;
      
      // Handle user transcript
      if (msg.type === 'user_transcript') {
        const event = msg.user_transcription_event as Record<string, unknown>;
        const userText = event?.user_transcript as string;
        if (userText) {
          setMessages(prev => [...prev, { role: 'user', content: userText }]);
          setCurrentTranscript('');
        }
      }
      
      // Handle agent response
      if (msg.type === 'agent_response') {
        const event = msg.agent_response_event as Record<string, unknown>;
        const agentText = event?.agent_response as string;
        if (agentText) {
          setMessages(prev => [...prev, { role: 'assistant', content: agentText }]);
          
          // Check for navigation commands in the response
          checkForNavigation(agentText);
        }
      }
    },
    onError: (error) => {
      console.error('ElevenLabs agent error:', error);
      setError('Er ging iets mis met de spraakassistent');
      toast({
        title: 'Fout',
        description: 'Kon geen verbinding maken met de spraakassistent',
        variant: 'destructive',
      });
    },
  });

  const checkForNavigation = (text: string) => {
    const lowerText = text.toLowerCase();
    
    const navRoutes: { keywords: string[]; path: string }[] = [
      { keywords: ['rechtenverkenner', 'rights explorer'], path: '/rechtenverkenner' },
      { keywords: ['tijdlijn', 'timeline'], path: '/tijdlijn' },
      { keywords: ['termijnen', 'deadlines'], path: '/termijnen' },
      { keywords: ['procesgids', 'process guide'], path: '/procesgids' },
      { keywords: ['home', 'begin', 'startpagina'], path: '/' },
    ];

    for (const route of navRoutes) {
      if (route.keywords.some(kw => lowerText.includes(kw) && 
          (lowerText.includes('ga naar') || lowerText.includes('navigeer') || lowerText.includes('open')))) {
        setTimeout(() => {
          navigate(route.path);
        }, 1500);
        break;
      }
    }
  };

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error: fnError } = await supabase.functions.invoke(
        'elevenlabs-conversation-token'
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.token) {
        throw new Error('Geen token ontvangen');
      }

      console.log('Starting conversation with token');

      // Start the conversation with WebRTC
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: 'webrtc',
      });

    } catch (err) {
      console.error('Failed to start conversation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Kon gesprek niet starten';
      setError(errorMessage);
      toast({
        title: 'Fout',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, toast]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentTranscript('');
    setError(null);
  }, []);

  return {
    // Connection state
    isConnected: conversation.status === 'connected',
    isConnecting,
    isSpeaking: conversation.isSpeaking,
    
    // Messages
    messages,
    currentTranscript,
    error,
    
    // Actions
    startConversation,
    endConversation,
    clearMessages,
  };
};
