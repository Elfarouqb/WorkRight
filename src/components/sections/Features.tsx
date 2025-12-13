import { motion } from "framer-motion";
import { Search, FileText, Calculator, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const features = [
    {
      icon: Search,
      title: t("features.explorer.title"),
      description: t("features.explorer.desc"),
      href: "/rechtenverkenner",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: FileText,
      title: t("features.timeline.title"),
      description: t("features.timeline.desc"),
      href: "/tijdlijn",
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      icon: Calculator,
      title: t("features.deadline.title"),
      description: t("features.deadline.desc"),
      href: "/termijnen",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: BookOpen,
      title: t("features.guide.title"),
      description: t("features.guide.desc"),
      href: "/procesgids",
      color: "bg-accent/20 text-accent-foreground",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-display-sm font-heading font-bold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
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
              <motion.div key={feature.href} variants={item}>
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
                        {t("features.view")}
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
