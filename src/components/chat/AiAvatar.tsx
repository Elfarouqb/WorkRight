import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AiAvatarProps {
  isListening?: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AiAvatar = ({ 
  isListening = false, 
  isProcessing = false, 
  isSpeaking = false,
  size = 'md',
  className 
}: AiAvatarProps) => {
  const isActive = isListening || isProcessing || isSpeaking;
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const innerSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer glow ring when active */}
      {isActive && (
        <motion.div
          className={cn(
            "absolute rounded-full",
            sizeClasses[size],
            isSpeaking 
              ? "bg-primary/20" 
              : isListening 
                ? "bg-accent/30" 
                : "bg-muted"
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Secondary pulse ring */}
      {(isSpeaking || isListening) && (
        <motion.div
          className={cn(
            "absolute rounded-full border-2",
            sizeClasses[size],
            isSpeaking ? "border-primary/40" : "border-accent/40"
          )}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* Avatar container */}
      <motion.div
        className={cn(
          "relative rounded-full overflow-hidden shadow-lg",
          innerSizeClasses[size],
          "bg-gradient-to-br from-primary via-primary/90 to-primary-foreground/20",
          "border-2 border-primary/30"
        )}
        animate={isActive ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={{
          duration: 0.8,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Face - SVG illustration */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
            </linearGradient>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5DEB3" />
              <stop offset="100%" stopColor="#DEB887" />
            </linearGradient>
          </defs>

          {/* Head/face circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill="url(#skinGradient)"
          />

          {/* Hair */}
          <ellipse 
            cx="50" 
            cy="28" 
            rx="30" 
            ry="18" 
            fill="#4A3728"
          />
          <ellipse 
            cx="30" 
            cy="35" 
            rx="8" 
            ry="12" 
            fill="#4A3728"
          />
          <ellipse 
            cx="70" 
            cy="35" 
            rx="8" 
            ry="12" 
            fill="#4A3728"
          />

          {/* Eyes */}
          <g>
            {/* Left eye */}
            <ellipse 
              cx="38" 
              cy="48" 
              rx="6" 
              ry={isProcessing ? 1 : 4} 
              fill="white"
            />
            <motion.circle 
              cx="38" 
              cy="48" 
              r={isProcessing ? 0 : 2.5}
              fill="#3D2314"
              animate={isListening ? { cy: [48, 46, 48] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            
            {/* Right eye */}
            <ellipse 
              cx="62" 
              cy="48" 
              rx="6" 
              ry={isProcessing ? 1 : 4} 
              fill="white"
            />
            <motion.circle 
              cx="62" 
              cy="48" 
              r={isProcessing ? 0 : 2.5}
              fill="#3D2314"
              animate={isListening ? { cy: [48, 46, 48] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </g>

          {/* Eyebrows */}
          <path
            d="M32 40 Q38 37 44 40"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M56 40 Q62 37 68 40"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Nose */}
          <path
            d="M50 52 L48 58 Q50 60 52 58 L50 52"
            fill="#D4A574"
          />

          {/* Mouth - changes based on state */}
          <motion.path
            d={
              isSpeaking 
                ? "M40 68 Q50 75 60 68 Q50 78 40 68" // Open mouth
                : isListening
                  ? "M40 66 Q50 72 60 66" // Gentle smile
                  : isProcessing
                    ? "M42 68 Q50 68 58 68" // Neutral/thinking
                    : "M40 66 Q50 70 60 66" // Default smile
            }
            fill={isSpeaking ? "#C77B7B" : "none"}
            stroke={isSpeaking ? "#8B5A5A" : "#C77B7B"}
            strokeWidth="2"
            strokeLinecap="round"
            animate={isSpeaking ? {
              d: [
                "M40 68 Q50 75 60 68 Q50 78 40 68",
                "M40 68 Q50 72 60 68 Q50 73 40 68",
                "M40 68 Q50 75 60 68 Q50 78 40 68",
              ]
            } : {}}
            transition={{
              duration: 0.3,
              repeat: isSpeaking ? Infinity : 0,
            }}
          />

          {/* Cheeks (blush) */}
          <circle cx="28" cy="58" r="5" fill="#FFB6C1" opacity="0.4" />
          <circle cx="72" cy="58" r="5" fill="#FFB6C1" opacity="0.4" />
        </svg>
      </motion.div>

      {/* Status indicator */}
      <motion.div
        className={cn(
          "absolute -bottom-1 -right-1 rounded-full flex items-center justify-center",
          size === 'lg' ? "w-8 h-8" : size === 'md' ? "w-6 h-6" : "w-4 h-4",
          isListening 
            ? "bg-accent" 
            : isSpeaking 
              ? "bg-primary" 
              : isProcessing 
                ? "bg-muted-foreground" 
                : "bg-success"
        )}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
      >
        {isProcessing && (
          <motion.div
            className="w-2/3 h-2/3 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  );
};
