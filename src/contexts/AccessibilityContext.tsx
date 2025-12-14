import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";

type FontMode = "default" | "dyslexic";
type TextSize = "default" | "large" | "larger";

interface AccessibilityContextType {
  fontMode: FontMode;
  setFontMode: (mode: FontMode) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  narratorEnabled: boolean;
  setNarratorEnabled: (enabled: boolean) => void;
  isNarrating: boolean;
  startNarrating: () => void;
  stopNarrating: () => void;
  speakText: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontMode, setFontModeState] = useState<FontMode>("default");
  const [textSize, setTextSizeState] = useState<TextSize>("default");
  const [narratorEnabled, setNarratorEnabledState] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontMode = localStorage.getItem("wr-font-mode") as FontMode | null;
    const savedTextSize = localStorage.getItem("wr-text-size") as TextSize | null;
    const savedNarrator = localStorage.getItem("wr-narrator") === "true";
    
    if (savedFontMode) setFontModeState(savedFontMode);
    if (savedTextSize) setTextSizeState(savedTextSize);
    setNarratorEnabledState(savedNarrator);
  }, []);

  // Apply classes to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Font mode
    root.classList.remove("font-dyslexic");
    if (fontMode === "dyslexic") {
      root.classList.add("font-dyslexic");
    }
    
    // Text size
    root.classList.remove("text-size-large", "text-size-larger");
    if (textSize === "large") {
      root.classList.add("text-size-large");
    } else if (textSize === "larger") {
      root.classList.add("text-size-larger");
    }
  }, [fontMode, textSize]);

  const setFontMode = (mode: FontMode) => {
    setFontModeState(mode);
    localStorage.setItem("wr-font-mode", mode);
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem("wr-text-size", size);
  };

  const setNarratorEnabled = (enabled: boolean) => {
    setNarratorEnabledState(enabled);
    localStorage.setItem("wr-narrator", String(enabled));
    if (!enabled) {
      stopNarrating();
    }
  };

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nl-NL';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Try to find a Dutch voice
    const voices = window.speechSynthesis.getVoices();
    const dutchVoice = voices.find(v => v.lang.startsWith('nl'));
    if (dutchVoice) {
      utterance.voice = dutchVoice;
    }

    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startNarrating = useCallback(() => {
    if (!narratorEnabled) return;
    
    // Get main content text
    const mainContent = document.querySelector('main') || document.body;
    const textContent = mainContent.innerText || mainContent.textContent || '';
    
    if (textContent.trim()) {
      speakText(textContent);
    }
  }, [narratorEnabled, speakText]);

  const stopNarrating = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsNarrating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{ 
      fontMode, 
      setFontMode, 
      textSize, 
      setTextSize,
      narratorEnabled,
      setNarratorEnabled,
      isNarrating,
      startNarrating,
      stopNarrating,
      speakText
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
