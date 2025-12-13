import { motion } from "framer-motion";
import { 
  Accessibility, 
  Heart, 
  Users, 
  Brain, 
  Glasses,
  Baby
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ProtectedCharacteristics() {
  const { t } = useLanguage();

  const characteristics = [
    { icon: Accessibility, label: t.disability },
    { icon: Users, label: t.raceEthnicity },
    { icon: Heart, label: t.genderSex },
    { icon: Brain, label: t.age },
    { icon: Glasses, label: t.religionBelief },
    { icon: Baby, label: t.pregnancy },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-display-sm font-heading font-bold text-foreground mb-4">
            {t.protectedCharacteristics}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.protectedCharacteristicsDesc}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {characteristics.map((char, index) => {
            const Icon = char.icon;
            return (
              <motion.div
                key={char.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">
                  {char.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t.moreCharacteristics}
        </p>
      </div>
    </section>
  );
}
