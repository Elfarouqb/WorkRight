import { Shield, Users, Lock, Heart } from "lucide-react";
import { motion } from "framer-motion";

const points = [
  {
    icon: Shield,
    title: "We support, not replace",
    description:
      "This tool helps you understand and prepare. It does not replace legal advice. Always speak to a professional before making decisions.",
  },
  {
    icon: Users,
    title: "Human help is available",
    description:
      "ACAS, Citizens Advice, and employment solicitors can provide the expert support you need. We'll point you in the right direction.",
  },
  {
    icon: Lock,
    title: "Your privacy matters",
    description:
      "We don't store your personal information. What you share stays with you. You're in control.",
  },
  {
    icon: Heart,
    title: "You're not alone",
    description:
      "Many people go through this. It's okay to feel overwhelmed. Take breaks. Come back when you're ready.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Reassurance() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary mb-3"
          >
            OUR PROMISE
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-display-sm font-heading mb-4"
          >
            Here to help, not to overwhelm
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-accessible text-muted-foreground"
          >
            We understand this is a difficult time. We've designed this tool 
            with care, keeping your wellbeing in mind.
          </motion.p>
        </div>

        {/* Points Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {points.map((point) => (
            <motion.div
              key={point.title}
              variants={item}
              className="flex gap-5"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <point.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg mb-2">
                  {point.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
