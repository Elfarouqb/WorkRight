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
        {/* Face - Photo */}
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face" 
          alt="AI Assistent"
          className="w-full h-full object-cover"
        />
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
