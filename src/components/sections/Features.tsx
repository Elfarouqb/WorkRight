import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Compass, 
  Calendar, 
  BookOpen, 
  Bell,
  ArrowRight,
  Accessibility,
  Volume2
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Compass,
    title: "Rights Explorer",
    description: "A guided conversation that helps you understand if what happened might be discrimination. We use plain words and real examples.",
    cta: "Explore Your Rights",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calendar,
    title: "Timeline Builder",
    description: "Write down what happened, when, and who was there. We'll help you create a clear record that advisors can use to help you.",
    cta: "Build Your Timeline",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BookOpen,
    title: "Process Guide",
    description: "Understand what ACAS conciliation means, what a tribunal involves, and what to expect at each stage. No surprises.",
    cta: "Learn the Process",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Bell,
    title: "Deadline Tracker",
    description: "You have strict time limits — usually 3 months minus 1 day. We'll help you track these dates and send reminders.",
    cta: "Check Deadlines",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const accessibilityFeatures = [
  {
    icon: Volume2,
    title: "Voice Support",
    description: "Listen to any page read aloud",
  },
  {
    icon: Accessibility,
    title: "Clear Language",
    description: "Written for all reading levels",
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

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary mb-3"
          >
            HOW WE HELP
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-display-sm font-heading mb-4"
          >
            Tools that support you
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-accessible text-muted-foreground"
          >
            We've built these tools with accessibility in mind. Take your time. 
            Go at your own pace. Come back whenever you need.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card variant="feature" className="h-full group">
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-accessible">
                    {feature.description}
                  </CardDescription>
                  <Button variant="ghost" className="p-0 h-auto text-primary hover:bg-transparent group/btn">
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Accessibility Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-2xl p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-xl font-bold mb-2">
                Designed for everyone
              </h3>
              <p className="text-muted-foreground">
                We've built this tool to be accessible for people with cognitive 
                disabilities, low literacy, or high stress.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {accessibilityFeatures.map((feat) => (
                <div
                  key={feat.title}
                  className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-lg"
                >
                  <feat.icon className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">{feat.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feat.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
