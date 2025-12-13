import { motion } from "framer-motion";

const steps = [
  {
    step: 1,
    title: "Verken je situatie",
    description: "Beantwoord vragen over wat er is gebeurd. Geen juridische taal, gewoon simpele vragen.",
  },
  {
    step: 2,
    title: "Documenteer alles",
    description: "Bouw een tijdlijn van gebeurtenissen. Dit helpt bij gesprekken met adviseurs.",
  },
  {
    step: 3,
    title: "Begrijp je opties",
    description: "Leer welke stappen je kunt zetten en welke termijnen belangrijk zijn.",
  },
  {
    step: 4,
    title: "Zoek hulp",
    description: "Neem contact op met Het Juridisch Loket of andere hulpbronnen met een duidelijk verhaal.",
  },
];

export function ProcessSteps() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-display-sm font-heading font-bold text-foreground mb-4">
            Hoe het werkt
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stap voor stap naar duidelijkheid. Op je eigen tempo.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-6"
                >
                  {/* Step number */}
                  <div className="shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full gradient-brand text-primary-foreground flex items-center justify-center font-bold text-lg shadow-soft">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
