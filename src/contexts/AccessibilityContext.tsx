import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";

type FontMode = "default" | "dyslexic";
type TextSize = "default" | "large" | "larger";
type NarratorLanguage = "nl" | "en";

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
  narratorLanguage: NarratorLanguage;
  setNarratorLanguage: (lang: NarratorLanguage) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// CSS class for highlighting narrated elements
const NARRATOR_HIGHLIGHT_CLASS = "narrator-highlight";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontMode, setFontModeState] = useState<FontMode>("default");
  const [textSize, setTextSizeState] = useState<TextSize>("default");
  const [narratorEnabled, setNarratorEnabledState] = useState(false);
  const [narratorLanguage, setNarratorLanguageState] = useState<NarratorLanguage>("nl");
  const [isNarrating, setIsNarrating] = useState(false);
  const currentElementRef = useRef<Element | null>(null);
  const elementsQueueRef = useRef<Element[]>([]);
  const currentIndexRef = useRef(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoveredElementRef = useRef<Element | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontMode = localStorage.getItem("wr-font-mode") as FontMode | null;
    const savedTextSize = localStorage.getItem("wr-text-size") as TextSize | null;
    const savedNarrator = localStorage.getItem("wr-narrator") === "true";
    const savedLanguage = localStorage.getItem("language") as NarratorLanguage | null;
    
    if (savedFontMode) setFontModeState(savedFontMode);
    if (savedTextSize) setTextSizeState(savedTextSize);
    setNarratorEnabledState(savedNarrator);
    if (savedLanguage) setNarratorLanguageState(savedLanguage);
  }, []);

  // Sync narrator language with main language setting
  useEffect(() => {
    const handleStorageChange = () => {
      const lang = localStorage.getItem("language") as NarratorLanguage | null;
      if (lang) setNarratorLanguageState(lang);
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for changes within the same tab
    const interval = setInterval(() => {
      const lang = localStorage.getItem("language") as NarratorLanguage | null;
      if (lang && lang !== narratorLanguage) {
        setNarratorLanguageState(lang);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [narratorLanguage]);

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

  const setNarratorLanguage = (lang: NarratorLanguage) => {
    setNarratorLanguageState(lang);
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

  // Get the best voice for the current language
  const getVoiceForLanguage = useCallback((voices: SpeechSynthesisVoice[]) => {
    const langCode = narratorLanguage === "nl" ? "nl" : "en";
    
    // Try to find a female voice first for a friendlier tone
    const femaleVoice = voices.find(v => 
      v.lang.startsWith(langCode) && 
      (v.name.toLowerCase().includes("female") || 
       v.name.toLowerCase().includes("vrouw") ||
       v.name.toLowerCase().includes("anna") ||
       v.name.toLowerCase().includes("ellen") ||
       v.name.toLowerCase().includes("sara") ||
       v.name.toLowerCase().includes("claire"))
    );
    
    if (femaleVoice) return femaleVoice;
    
    // Fall back to any voice for the language
    return voices.find(v => v.lang.startsWith(langCode));
  }, [narratorLanguage]);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = narratorLanguage === "nl" ? "nl-NL" : "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.05; // Slightly higher for a friendlier female tone
    
    // Try to find the best voice
    const voices = window.speechSynthesis.getVoices();
    const voice = getVoiceForLanguage(voices);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    window.speechSynthesis.speak(utterance);
  }, [narratorLanguage, getVoiceForLanguage]);

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
    utterance.lang = narratorLanguage === "nl" ? "nl-NL" : "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const voice = getVoiceForLanguage(voices);
    if (voice) {
      utterance.voice = voice;
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
  }, [clearHighlight, highlightElement, narratorLanguage, getVoiceForLanguage]);

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

  // Hover-to-speak functionality
  useEffect(() => {
    if (!narratorEnabled || !('speechSynthesis' in window)) return;

    const HOVER_DELAY = 400; // 0.4 seconds

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target) return;

      // Check if it's a readable element
      const readableSelectors = 'h1, h2, h3, h4, h5, h6, p, li, button, a, span, label, [role="button"]';
      const readableElement = target.matches(readableSelectors) 
        ? target 
        : target.closest(readableSelectors);

      if (!readableElement) return;

      const text = readableElement.textContent?.trim();
      if (!text || text.length < 2) return;

      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      hoveredElementRef.current = readableElement;

      // Set timeout to speak after delay
      hoverTimeoutRef.current = setTimeout(() => {
        if (hoveredElementRef.current === readableElement) {
          // Add highlight
          readableElement.classList.add(NARRATOR_HIGHLIGHT_CLASS);
          
          // Speak the text
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = narratorLanguage === "nl" ? "nl-NL" : "en-US";
          utterance.rate = 0.9;
          utterance.pitch = 1.05;

          const voices = window.speechSynthesis.getVoices();
          const voice = getVoiceForLanguage(voices);
          if (voice) {
            utterance.voice = voice;
          }

          utterance.onend = () => {
            readableElement.classList.remove(NARRATOR_HIGHLIGHT_CLASS);
          };

          window.speechSynthesis.speak(utterance);
        }
      }, HOVER_DELAY);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target) return;

      // Clear timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      // Remove highlight if present
      const readableSelectors = 'h1, h2, h3, h4, h5, h6, p, li, button, a, span, label, [role="button"]';
      const readableElement = target.matches(readableSelectors) 
        ? target 
        : target.closest(readableSelectors);

      if (readableElement) {
        readableElement.classList.remove(NARRATOR_HIGHLIGHT_CLASS);
      }

      hoveredElementRef.current = null;
    };

    // Add event listeners
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [narratorEnabled, narratorLanguage, getVoiceForLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      clearHighlight();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
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
      speakText,
      narratorLanguage,
      setNarratorLanguage,
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
