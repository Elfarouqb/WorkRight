import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function DeadlineAlert() {
  return (
    <section id="deadlines" className="py-20 md:py-28 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-calm p-8 md:p-12 lg:p-16"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Alert Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-primary-foreground">
                Important: Time-Sensitive
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-display-sm font-heading text-primary-foreground mb-6">
              You have limited time to act
            </h2>

            {/* Explanation */}
            <p className="text-lg text-primary-foreground/90 mb-8 readable-width mx-auto">
              In the UK, you usually have{" "}
              <strong className="text-warning">3 months minus 1 day</strong>{" "}
              from when the discrimination happened to start your claim with
              ACAS. Missing this deadline could mean losing your right to make a
              claim.
            </p>

            {/* Timeline Visual */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20">
                <Calendar className="h-6 w-6 text-primary-foreground" />
                <div className="text-left">
                  <div className="text-sm text-primary-foreground/80">
                    Your deadline
                  </div>
                  <div className="font-heading font-bold text-xl text-primary-foreground">
                    3 months − 1 day
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="accent"
                size="xl"
                className="text-accent-foreground"
              >
                Calculate Your Deadline
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                variant="ghost"
                size="xl"
                className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground border border-white/20"
              >
                Learn About Extensions
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
