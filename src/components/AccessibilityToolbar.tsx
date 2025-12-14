import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Accessibility, Type, ZoomIn, Check, Volume2, VolumeX, Play, Square } from "lucide-react";

export function AccessibilityToolbar() {
  const { 
    fontMode, 
    setFontMode, 
    textSize, 
    setTextSize,
    narratorEnabled,
    setNarratorEnabled,
    isNarrating,
    startNarrating,
    stopNarrating
  } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2"
          aria-label="Accessibility options"
        >
          <Accessibility className="h-4 w-4" />
          <span className="hidden sm:inline">Accessibility</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          {/* Narrator Mode */}
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              Narrator Mode
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Let the page content be read aloud to you
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setNarratorEnabled(!narratorEnabled)}
                className={`flex-1 py-2 px-3 rounded-lg border text-center transition-all flex items-center justify-center gap-2 ${
                  narratorEnabled
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {narratorEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Enabled</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span className="text-sm font-medium">Disabled</span>
                  </>
                )}
              </button>
              {narratorEnabled && (
                <button
                  onClick={isNarrating ? stopNarrating : startNarrating}
                  className={`py-2 px-4 rounded-lg border transition-all flex items-center gap-2 ${
                    isNarrating
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-primary bg-primary text-primary-foreground"
                  }`}
                >
                  {isNarrating ? (
                    <>
                      <Square className="h-4 w-4" />
                      <span className="text-sm font-medium">Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span className="text-sm font-medium">Play</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <h4 className="font-heading font-bold text-sm flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Reading Font
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Choose a font that is easier for you to read
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFontMode("default")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  fontMode === "default"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Standard</span>
                  {fontMode === "default" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-body">
                  Atkinson Hyperlegible
                </span>
              </button>
              <button
                onClick={() => setFontMode("dyslexic")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  fontMode === "dyslexic"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Dyslexia</span>
                  {fontMode === "dyslexic" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "OpenDyslexic, sans-serif" }}>
                  OpenDyslexic
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <h4 className="font-heading font-bold text-sm flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-primary" />
              Text Size
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Make everything larger and easier to see
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setTextSize("default")}
                className={`flex-1 py-2 px-3 rounded-lg border text-center transition-all ${
                  textSize === "default"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-sm font-medium">A</span>
              </button>
              <button
                onClick={() => setTextSize("large")}
                className={`flex-1 py-2 px-3 rounded-lg border text-center transition-all ${
                  textSize === "large"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-base font-medium">A</span>
              </button>
              <button
                onClick={() => setTextSize("larger")}
                className={`flex-1 py-2 px-3 rounded-lg border text-center transition-all ${
                  textSize === "larger"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-lg font-medium">A</span>
              </button>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Standard</span>
              <span>Large</span>
              <span>Larger</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Your preferences are saved automatically.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
