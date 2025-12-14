import { useState, useCallback } from 'react';

const SEND_TRANSCRIPT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-transcript`;

interface SendTranscriptParams {
  transcript: string;
  email?: string;
  name?: string;
}

interface SendTranscriptResult {
  ok: boolean;
  error?: string;
  status?: number;
  details?: string;
}

/**
 * Hook for sending conversation transcripts to Activepieces for AI summarization and email delivery.
 *
 * Usage:
 * ```tsx
 * const { sendTranscript, isLoading, error, success } = useSendTranscript();
 *
 * const handleSend = async () => {
 *   const result = await sendTranscript({
 *     transcript: "Full conversation text...",
 *     email: "user@example.com",  // optional
 *     name: "User Name",          // optional
 *   });
 *   if (result.ok) {
 *     console.log("Transcript sent successfully!");
 *   }
 * };
 * ```
 */
export const useSendTranscript = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendTranscript = useCallback(async (params: SendTranscriptParams): Promise<SendTranscriptResult> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(SEND_TRANSCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          transcript: params.transcript,
          email: params.email || '',
          name: params.name || '',
        }),
      });

      const data: SendTranscriptResult = await response.json();

      if (!response.ok || !data.ok) {
        const errorMessage = data.error || `Request failed with status ${response.status}`;
        setError(errorMessage);
        return { ok: false, error: errorMessage };
      }

      setSuccess(true);
      return { ok: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send transcript';
      setError(errorMessage);
      return { ok: false, error: errorMessage };

    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    sendTranscript,
    isLoading,
    error,
    success,
    reset,
  };
};
