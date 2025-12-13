import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Heart, Clock, MessageCircle, Mic } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-soft" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Shield className="w-4 h-4" />
              Gratis en vertrouwelijk
            </div>

            {/* Headline */}
            <h1 className="text-display-sm md:text-display font-heading font-extrabold text-foreground text-balance">
              Begrijp je rechten na ontslag
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ontslagen en vermoed je discriminatie? Wij helpen je stap voor stap. 
              Geen juridische taal, geen oordeel - gewoon duidelijke uitleg en praktische hulp.
            </p>

            {/* Main CTA - Hulp Button */}
            <div className="pt-4">
              <Link to="/hulp">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 hsl(var(--primary) / 0.4)",
                      "0 0 0 12px hsl(var(--primary) / 0)",
                      "0 0 0 0 hsl(var(--primary) / 0)"
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-block rounded-lg"
                >
                  <Button size="lg" className="gap-3 text-lg font-semibold px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow">
                    <MessageCircle className="w-6 h-6" />
                    Vraag hulp
                    <span className="text-primary-foreground/70 text-sm ml-2">
                      (spraak of tekst)
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/rechtenverkenner">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold">
                  Start de Rechtenverkenner
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/procesgids">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto text-base font-semibold">
                  Bekijk de Procesgids
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Geen oordeel</p>
                <p className="text-sm text-muted-foreground">We luisteren</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Termijn-alerts</p>
                <p className="text-sm text-muted-foreground">Nooit te laat</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">100% privé</p>
                <p className="text-sm text-muted-foreground">Jouw gegevens</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
