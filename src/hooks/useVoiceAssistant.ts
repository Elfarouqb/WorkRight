import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Message = { role: 'user' | 'assistant'; content: string };

export const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get current user ID for saving data
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Kon microfoon niet starten. Controleer je instellingen.');
      toast({
        title: 'Microfoon fout',
        description: 'Kon microfoon niet starten. Controleer je browser instellingen.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setTranscript('');
    
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64Audio = btoa(binary);
      
      // Step 1: Transcribe audio
      console.log('Transcribing audio...');
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('voice-assistant', {
        body: { action: 'transcribe', audio: base64Audio }
      });
      
      if (transcribeError) throw new Error(transcribeError.message);
      if (!transcribeData?.text) throw new Error('Geen tekst herkend');
      
      const userText = transcribeData.text;
      setTranscript(userText);
      console.log('Transcribed:', userText);
      
      // Add user message immediately for faster feedback
      const userMessage: Message = { role: 'user', content: userText };
      setMessages(prev => [...prev, userMessage]);
      
      // Step 2: Get AI response (with tool calling)
      console.log('Getting AI response...');
      const { data: chatData, error: chatError } = await supabase.functions.invoke('voice-assistant', {
        body: { 
          action: 'chat', 
          text: userText,
          messages: messages.slice(-6),
          userId: userId // Pass userId for saving data
        }
      });
      
      if (chatError) throw new Error(chatError.message);
      
      const assistantText = chatData?.text || 'Sorry, ik begreep dat niet.';
      const navigateTo = chatData?.navigate;
      const toolResults = chatData?.toolResults;
      
      // Show toast if actions were executed
      if (toolResults && toolResults.length > 0) {
        toast({
          title: 'Actie uitgevoerd',
          description: 'Gegevens zijn opgeslagen in je tijdlijn.',
        });
      }
      
      // Add assistant message immediately - don't wait for speech
      const assistantMessage: Message = { role: 'assistant', content: assistantText };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Processing is done, now speaking
      setIsProcessing(false);
      
      // Start speaking
      await speakText(assistantText);
      
      // Navigate after speaking if needed
      if (navigateTo) {
        console.log('Navigating to:', navigateTo);
        navigate(navigateTo);
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Er ging iets mis';
      setError(errorMessage);
      toast({
        title: 'Fout',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    
    try {
      // Use streaming fetch directly for faster audio playback
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: 'speak', text }),
        }
      );
      
      if (!response.ok) {
        throw new Error('TTS request failed');
      }
      
      // Get audio blob directly from streaming response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
      
    } catch (err) {
      console.error('Error speaking:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    messages,
    transcript,
    error,
    startListening,
    stopListening,
    stopSpeaking,
    clearMessages,
  };
};
