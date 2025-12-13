import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Scale, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Gather Your Story",
    description: "We help you write down what happened — when, where, and who was involved. You don't need perfect memory. We'll take it slowly.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    number: "02",
    icon: Users,
    title: "ACAS Early Conciliation",
    description: "Before any tribunal, you must contact ACAS. It's free. They try to help you and your employer reach an agreement. We'll explain exactly what to expect.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    number: "03",
    icon: Scale,
    title: "Employment Tribunal",
    description: "If conciliation doesn't work, your case may go to a tribunal. This is like a court, but less formal. We'll help you understand what that means.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Resolution",
    description: "Whether through agreement or tribunal decision, you'll reach a conclusion. We'll be with you every step, helping you understand your options.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ProcessSteps() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary mb-3"
          >
            THE JOURNEY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-display-sm font-heading mb-4"
          >
            What happens next?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-accessible text-muted-foreground"
          >
            The process can feel overwhelming. Here's a simple overview of the
            steps ahead. You don't need to do this alone.
          </motion.p>
        </div>

        {/* Steps Timeline */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={item}>
                <Card variant="step" className="h-full relative">
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-background border border-border font-heading font-bold text-sm text-muted-foreground">
                    Step {step.number}
                  </div>

                  <CardHeader className="pt-8">
                    <div
                      className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}
                    >
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-accessible-sm">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
