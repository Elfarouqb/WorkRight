import { motion } from "framer-motion";
import { Search, FileText, Calculator, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Search,
    title: "Rechtenverkenner",
    description: "Beantwoord eenvoudige vragen en ontdek of wat jou is overkomen discriminatie kan zijn.",
    href: "/rechtenverkenner",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    title: "Tijdlijnbouwer",
    description: "Documenteer gebeurtenissen stap voor stap. Handig voor gesprekken met adviseurs.",
    href: "/tijdlijn",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Calculator,
    title: "Termijnberekener",
    description: "Bereken belangrijke deadlines en vergeet nooit een termijn.",
    href: "/termijnen",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpen,
    title: "Procesgids",
    description: "Begrijp hoe het Nederlandse systeem werkt, met links naar hulpbronnen.",
    href: "/procesgids",
    color: "bg-accent/20 text-accent-foreground",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-display-sm font-heading font-bold text-foreground mb-4">
            Tools die je helpen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Alles wat je nodig hebt om je situatie te begrijpen en je voor te bereiden.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={item}>
                <Link
                  to={feature.href}
                  className="block h-full p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1 text-primary font-medium text-sm">
                        Bekijken
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
