import { useState, useEffect, createContext, useContext } from "react";

type FontMode = "default" | "dyslexic";
type TextSize = "default" | "large" | "larger";

interface AccessibilityContextType {
  fontMode: FontMode;
  setFontMode: (mode: FontMode) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontMode, setFontModeState] = useState<FontMode>("default");
  const [textSize, setTextSizeState] = useState<TextSize>("default");

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontMode = localStorage.getItem("wr-font-mode") as FontMode | null;
    const savedTextSize = localStorage.getItem("wr-text-size") as TextSize | null;
    
    if (savedFontMode) setFontModeState(savedFontMode);
    if (savedTextSize) setTextSizeState(savedTextSize);
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

  return (
    <AccessibilityContext.Provider value={{ fontMode, setFontMode, textSize, setTextSize }}>
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
