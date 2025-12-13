import { useState, useCallback, useRef } from 'react';
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      // Add user message
      const userMessage: Message = { role: 'user', content: userText };
      setMessages(prev => [...prev, userMessage]);
      
      // Step 2: Get AI response
      console.log('Getting AI response...');
      const { data: chatData, error: chatError } = await supabase.functions.invoke('voice-assistant', {
        body: { 
          action: 'chat', 
          text: userText,
          messages: messages.slice(-10) // Send last 10 messages for context
        }
      });
      
      if (chatError) throw new Error(chatError.message);
      
      const assistantText = chatData?.text || 'Sorry, ik begreep dat niet.';
      const navigateTo = chatData?.navigate;
      
      // Add assistant message
      const assistantMessage: Message = { role: 'assistant', content: assistantText };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Step 3: Speak response
      console.log('Speaking response...');
      await speakText(assistantText);
      
      // Step 4: Navigate if needed
      if (navigateTo) {
        console.log('Navigating to:', navigateTo);
        setTimeout(() => {
          navigate(navigateTo);
        }, 500);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: { action: 'speak', text }
      });
      
      if (error) throw new Error(error.message);
      if (!data?.audio) throw new Error('Geen audio ontvangen');
      
      // Play audio
      const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
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
    clearMessages,
  };
};
