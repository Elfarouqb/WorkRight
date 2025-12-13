import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function DeadlineAlert() {
  return (
    <section id="deadlines" className="py-16 md:py-24 bg-accent/10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-6">
            <AlertTriangle className="w-8 h-8 text-accent-foreground" />
          </div>

          <h2 className="text-display-sm font-heading font-bold text-foreground mb-4">
            Termijnen zijn belangrijk
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            In Nederland heb je vaak beperkte tijd om actie te ondernemen. Bijvoorbeeld: 
            bezwaar bij het UWV moet binnen <strong className="text-foreground">6 weken</strong>. 
            Weet jij wanneer jouw termijnen aflopen?
          </p>

          <Link to="/termijnen">
            <Button size="lg" className="gap-2 font-semibold">
              Bereken mijn termijnen
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
