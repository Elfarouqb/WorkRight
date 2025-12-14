import Threads from "@/components/ui/Threads";

const PageBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Threads animation overlay */}
      <Threads
        color={[0.165, 0.616, 0.561]} // Teal primary color
        amplitude={0.5}
        distance={0.4}
        enableMouseInteraction={true}
      />
      
      {/* Subtle accent glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
    </div>
  );
};

export default PageBackground;
