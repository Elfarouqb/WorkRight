import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Features } from "@/components/sections/Features";
import { DeadlineAlert } from "@/components/sections/DeadlineAlert";
import { Reassurance } from "@/components/sections/Reassurance";
import { ProtectedCharacteristics } from "@/components/sections/ProtectedCharacteristics";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProcessSteps />
        <ProtectedCharacteristics />
        <Features />
        <DeadlineAlert />
        <Reassurance />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
