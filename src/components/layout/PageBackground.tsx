import Orb from "@/components/ui/Orb";

const PageBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-visible pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Orb animation - centered and full coverage */}
      <div className="absolute -top-1/4 -left-1/4 w-[150vw] h-[150vh] pointer-events-auto opacity-30">
        <Orb
          hue={0}
          hoverIntensity={0.1}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>
    </div>
  );
};

export default PageBackground;
