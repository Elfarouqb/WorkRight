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

// CSS class for highlighting narrated elements
const NARRATOR_HIGHLIGHT_CLASS = "narrator-highlight";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontMode, setFontModeState] = useState<FontMode>("default");
  const [textSize, setTextSizeState] = useState<TextSize>("default");
  const [narratorEnabled, setNarratorEnabledState] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const currentElementRef = useRef<Element | null>(null);
  const elementsQueueRef = useRef<Element[]>([]);
  const currentIndexRef = useRef(0);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontMode = localStorage.getItem("wr-font-mode") as FontMode | null;
    const savedTextSize = localStorage.getItem("wr-text-size") as TextSize | null;
    const savedNarrator = localStorage.getItem("wr-narrator") === "true";
    
    if (savedFontMode) setFontModeState(savedFontMode);
    if (savedTextSize) setTextSizeState(savedTextSize);
    setNarratorEnabledState(savedNarrator);
  }, []);

  // Inject highlight styles
  useEffect(() => {
    const styleId = "narrator-highlight-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .${NARRATOR_HIGHLIGHT_CLASS} {
          outline: 3px solid hsl(var(--primary)) !important;
          outline-offset: 4px !important;
          border-radius: 8px !important;
          transition: outline 0.2s ease-in-out !important;
          background-color: hsl(var(--primary) / 0.05) !important;
        }
      `;
      document.head.appendChild(style);
    }
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

  const clearHighlight = useCallback(() => {
    if (currentElementRef.current) {
      currentElementRef.current.classList.remove(NARRATOR_HIGHLIGHT_CLASS);
      currentElementRef.current = null;
    }
  }, []);

  const highlightElement = useCallback((element: Element) => {
    clearHighlight();
    element.classList.add(NARRATOR_HIGHLIGHT_CLASS);
    currentElementRef.current = element;
    
    // Scroll element into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [clearHighlight]);

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

    window.speechSynthesis.speak(utterance);
  }, []);

  const narrateNextElement = useCallback(() => {
    const elements = elementsQueueRef.current;
    const index = currentIndexRef.current;

    if (index >= elements.length) {
      // Done narrating all elements
      clearHighlight();
      setIsNarrating(false);
      return;
    }

    const element = elements[index];
    const text = element.textContent?.trim() || "";

    if (!text) {
      // Skip empty elements
      currentIndexRef.current++;
      narrateNextElement();
      return;
    }

    highlightElement(element);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nl-NL';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const dutchVoice = voices.find(v => v.lang.startsWith('nl'));
    if (dutchVoice) {
      utterance.voice = dutchVoice;
    }

    utterance.onend = () => {
      currentIndexRef.current++;
      narrateNextElement();
    };

    utterance.onerror = () => {
      clearHighlight();
      setIsNarrating(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [clearHighlight, highlightElement]);

  const startNarrating = useCallback(() => {
    if (!narratorEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any current narration
    window.speechSynthesis.cancel();
    clearHighlight();

    // Find readable elements - headings, paragraphs, list items, buttons with text
    const mainContent = document.querySelector('main') || document.body;
    const readableSelectors = 'h1, h2, h3, h4, h5, h6, p, li, button, a, span.text-lg, span.text-xl, span.text-2xl, div.text-lg, div.text-xl';
    const elements = Array.from(mainContent.querySelectorAll(readableSelectors))
      .filter(el => {
        const text = el.textContent?.trim();
        // Filter out empty elements and elements that are children of other readable elements
        if (!text || text.length < 2) return false;
        // Check if parent is already in our list (avoid duplicate reading)
        const parent = el.parentElement;
        if (parent && parent.matches(readableSelectors)) return false;
        return true;
      });

    if (elements.length === 0) {
      // Fallback: read all text at once
      const text = mainContent.textContent?.trim() || "";
      if (text) speakText(text);
      return;
    }

    elementsQueueRef.current = elements;
    currentIndexRef.current = 0;
    setIsNarrating(true);
    narrateNextElement();
  }, [narratorEnabled, clearHighlight, speakText, narrateNextElement]);

  const stopNarrating = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearHighlight();
    elementsQueueRef.current = [];
    currentIndexRef.current = 0;
    setIsNarrating(false);
  }, [clearHighlight]);

  const setNarratorEnabled = (enabled: boolean) => {
    setNarratorEnabledState(enabled);
    localStorage.setItem("wr-narrator", String(enabled));
    if (!enabled) {
      stopNarrating();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      clearHighlight();
    };
  }, [clearHighlight]);

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
