import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, AlertTriangle, Clock, CheckCircle, ExternalLink, Calculator } from "lucide-react";
import { format, addWeeks, addMonths, addYears, differenceInDays, isBefore } from "date-fns";
import { nl } from "date-fns/locale";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface Deadline {
  name: string;
  description: string;
  date: Date;
  urgency: "critical" | "important" | "normal";
  resource?: { name: string; url: string };
}

const Termijnen = () => {
  const [dismissalDate, setDismissalDate] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  const calculateDeadlines = () => {
    if (!dismissalDate) return;

    const date = new Date(dismissalDate);
    const today = new Date();

    const calculatedDeadlines: Deadline[] = [
      {
        name: "Bezwaar tegen UWV beslissing",
        description: "Als je een beslissing hebt ontvangen van het UWV waar je het niet mee eens bent.",
        date: addWeeks(date, 6),
        urgency: "critical",
        resource: { name: "UWV Bezwaar", url: "https://www.uwv.nl/particulieren/bezwaar" },
      },
      {
        name: "Verzoek tot vernietiging ontslag",
        description: "Bij de kantonrechter als je vindt dat het ontslag onterecht was.",
        date: addMonths(date, 2),
        urgency: "critical",
        resource: { name: "Rechtspraak.nl", url: "https://www.rechtspraak.nl" },
      },
      {
        name: "WW-uitkering aanvragen",
        description: "Vraag je WW-uitkering aan zodra je weet dat je werkloos wordt.",
        date: addWeeks(date, 1),
        urgency: "important",
        resource: { name: "WW aanvragen", url: "https://www.uwv.nl/particulieren/werkloosheid" },
      },
      {
        name: "Klacht bij College voor de Rechten van de Mens",
        description: "Bij vermoeden van discriminatie. Geen harde termijn, maar sneller is beter.",
        date: addMonths(date, 6),
        urgency: "important",
        resource: { name: "Mensenrechten.nl", url: "https://mensenrechten.nl/nl/klacht-indienen" },
      },
      {
        name: "Vordering loon of schadevergoeding",
        description: "Maximale termijn voor financiële claims.",
        date: addYears(date, 5),
        urgency: "normal",
        resource: { name: "Juridisch Loket", url: "https://www.juridischloket.nl" },
      },
    ];

    // Sort by date and filter out past deadlines, but keep showing them if they're in the past
    const sortedDeadlines = calculatedDeadlines.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setDeadlines(sortedDeadlines);
    setShowResults(true);
  };

  const getUrgencyInfo = (deadline: Deadline) => {
    const today = new Date();
    const daysLeft = differenceInDays(deadline.date, today);
    const isPast = isBefore(deadline.date, today);

    if (isPast) {
      return {
        color: "border-destructive bg-destructive/10",
        icon: AlertTriangle,
        iconColor: "text-destructive",
        text: "Verlopen",
        textColor: "text-destructive",
      };
    }

    if (daysLeft <= 7) {
      return {
        color: "border-destructive bg-destructive/5",
        icon: AlertTriangle,
        iconColor: "text-destructive",
        text: `Nog ${daysLeft} dag${daysLeft === 1 ? "" : "en"}`,
        textColor: "text-destructive font-bold",
      };
    }

    if (daysLeft <= 30) {
      return {
        color: "border-warning bg-warning/5",
        icon: Clock,
        iconColor: "text-warning",
        text: `Nog ${daysLeft} dagen`,
        textColor: "text-warning font-semibold",
      };
    }

    return {
      color: "border-success bg-success/5",
      icon: CheckCircle,
      iconColor: "text-success",
      text: `Nog ${daysLeft} dagen`,
      textColor: "text-success",
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold mb-3">Termijnberekener</h1>
            <p className="text-lg text-muted-foreground">
              Bereken belangrijke termijnen en deadlines voor jouw situatie.
            </p>
          </div>

          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Vul je ontslagdatum in
              </CardTitle>
              <CardDescription>
                Dit is de datum waarop je bent ontslagen of je contract is beëindigd.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="dismissal-date" className="sr-only">Ontslagdatum</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dismissal-date"
                      type="date"
                      value={dismissalDate}
                      onChange={(e) => setDismissalDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={calculateDeadlines} disabled={!dismissalDate}>
                  Bereken termijnen
                </Button>
              </div>
            </CardContent>
          </Card>

          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-heading font-semibold">
                Jouw belangrijke termijnen
              </h2>

              <div className="space-y-4">
                {deadlines.map((deadline, index) => {
                  const urgency = getUrgencyInfo(deadline);
                  const Icon = urgency.icon;

                  return (
                    <motion.div
                      key={deadline.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${urgency.color} transition-all`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`shrink-0 mt-1 ${urgency.iconColor}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-semibold">{deadline.name}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {deadline.description}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className={`text-sm ${urgency.textColor}`}>
                                    {urgency.text}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(deadline.date, "d MMMM yyyy", { locale: nl })}
                                  </p>
                                </div>
                              </div>
                              {deadline.resource && (
                                <a
                                  href={deadline.resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                                >
                                  {deadline.resource.name}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <Card className="mt-8 border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Belangrijk</p>
                      <p className="text-muted-foreground mt-1">
                        Deze termijnen zijn indicatief. Je exacte situatie kan andere termijnen hebben. 
                        Neem altijd contact op met Het Juridisch Loket (0900-8020) voor advies op maat.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!showResults && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Weet je je ontslagdatum?
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Vul hierboven je ontslagdatum in en wij berekenen de belangrijkste 
                  termijnen en deadlines voor jouw situatie.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Termijnen;
