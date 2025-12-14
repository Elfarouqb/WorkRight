import Orb from "@/components/ui/Orb";

const PageBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Orb animation - positioned for visibility */}
      <div className="absolute inset-0 pointer-events-auto opacity-40">
        <Orb
          hue={0} // Uses teal base colors already
          hoverIntensity={0.1}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>
      
      {/* Subtle accent glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
    </div>
  );
};

export default PageBackground;
