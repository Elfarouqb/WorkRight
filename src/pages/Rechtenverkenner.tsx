import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface Question {
  id: string;
  question: string;
  explanation: string;
  options: { value: string; label: string; description?: string }[];
}

const questions: Question[] = [
  {
    id: "employment",
    question: "Wat was je arbeidssituatie?",
    explanation: "Dit helpt ons te begrijpen welke regels op jouw situatie van toepassing zijn.",
    options: [
      { value: "vast", label: "Vast contract", description: "Contract voor onbepaalde tijd" },
      { value: "tijdelijk", label: "Tijdelijk contract", description: "Contract voor bepaalde tijd" },
      { value: "uitzend", label: "Uitzendwerk", description: "Via een uitzendbureau" },
      { value: "zzp", label: "ZZP / freelance", description: "Als zelfstandige" },
      { value: "weet_niet", label: "Weet ik niet zeker", description: "Geen zorgen, we helpen je verder" },
    ],
  },
  {
    id: "dismissal_type",
    question: "Hoe ben je ontslagen?",
    explanation: "De manier waarop je ontslag is gegaan bepaalt welke stappen je kunt nemen.",
    options: [
      { value: "op_staande_voet", label: "Op staande voet", description: "Direct ontslagen zonder opzegtermijn" },
      { value: "met_opzegtermijn", label: "Met opzegtermijn", description: "Normale opzegprocedure" },
      { value: "contract_niet_verlengd", label: "Contract niet verlengd", description: "Tijdelijk contract afgelopen" },
      { value: "vaststellingsovereenkomst", label: "Vaststellingsovereenkomst", description: "Met wederzijds goedvinden" },
      { value: "anders", label: "Anders / weet niet", description: "We helpen je uitzoeken wat er is gebeurd" },
    ],
  },
  {
    id: "protected_characteristic",
    question: "Denk je dat je ontslag te maken heeft met een van deze kenmerken?",
    explanation: "In Nederland is het verboden om iemand te ontslaan vanwege deze kenmerken.",
    options: [
      { value: "gezondheid", label: "Gezondheid of handicap", description: "Ziekte, beperking of chronische aandoening" },
      { value: "afkomst", label: "Afkomst of huidskleur", description: "Ras, nationaliteit of etnische achtergrond" },
      { value: "geslacht", label: "Geslacht of gender", description: "Man, vrouw of non-binair" },
      { value: "leeftijd", label: "Leeftijd", description: "Te jong of te oud" },
      { value: "godsdienst", label: "Geloof of overtuiging", description: "Religie of levensbeschouwing" },
      { value: "seksuele_gerichtheid", label: "Seksuele gerichtheid", description: "Homo, lesbisch, bi of hetero" },
      { value: "zwangerschap", label: "Zwangerschap of ouderschap", description: "Zwanger, recent bevallen of ouderschapsverlof" },
      { value: "meerdere", label: "Meerdere van bovenstaande", description: "Een combinatie van factoren" },
      { value: "geen", label: "Geen van deze", description: "Of ik weet het niet zeker" },
    ],
  },
  {
    id: "evidence",
    question: "Heb je bewijs of aanwijzingen?",
    explanation: "Bewijs kan helpen, maar is niet altijd nodig. Denk aan e-mails, berichten, getuigen, of een patroon.",
    options: [
      { value: "schriftelijk", label: "Schriftelijk bewijs", description: "E-mails, WhatsApp, brieven" },
      { value: "getuigen", label: "Getuigen", description: "Collega's of anderen die iets hebben gezien" },
      { value: "patroon", label: "Patroon van gedrag", description: "Meerdere incidenten of opmerkingen" },
      { value: "geen", label: "Geen bewijs", description: "Dat is niet erg, we kunnen toch verder" },
      { value: "weet_niet", label: "Weet ik niet", description: "We helpen je bedenken wat je hebt" },
    ],
  },
  {
    id: "timeframe",
    question: "Wanneer is dit gebeurd?",
    explanation: "Termijnen zijn belangrijk in Nederland. Sommige stappen moet je binnen een bepaalde tijd zetten.",
    options: [
      { value: "week", label: "Afgelopen week", description: "Minder dan 7 dagen geleden" },
      { value: "maand", label: "Afgelopen maand", description: "1 tot 4 weken geleden" },
      { value: "drie_maanden", label: "Afgelopen 3 maanden", description: "1 tot 3 maanden geleden" },
      { value: "langer", label: "Langer geleden", description: "Meer dan 3 maanden" },
      { value: "weet_niet", label: "Weet ik niet precies", description: "We kunnen dit samen uitzoeken" },
    ],
  },
];

const Rechtenverkenner = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentStep) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const getResultAnalysis = () => {
    const hasProtectedCharacteristic = answers.protected_characteristic && answers.protected_characteristic !== "geen";
    const isRecent = ["week", "maand", "drie_maanden"].includes(answers.timeframe);
    const hasEvidence = answers.evidence && answers.evidence !== "geen";

    return {
      hasProtectedCharacteristic,
      isRecent,
      hasEvidence,
      urgency: !isRecent ? "high" : "normal",
    };
  };

  if (showResults) {
    const analysis = getResultAnalysis();
    
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-success mx-auto" />
                <h1 className="text-3xl font-heading font-bold">Je antwoorden zijn bekeken</h1>
                <p className="text-lg text-muted-foreground">
                  Op basis van wat je hebt verteld, zijn hier onze suggesties.
                </p>
              </div>

              {analysis.hasProtectedCharacteristic && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Mogelijke discriminatie</h3>
                        <p className="text-muted-foreground">
                          Op basis van je antwoorden lijkt het erop dat je ontslag mogelijk te maken heeft 
                          met een beschermd kenmerk. Dit kan discriminatie zijn volgens de wet.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!analysis.isRecent && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertCircle className="w-6 h-6 text-warning shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Let op de termijnen</h3>
                        <p className="text-muted-foreground">
                          Als je ontslag langer geleden was, zijn sommige termijnen mogelijk verlopen. 
                          Neem snel contact op met Het Juridisch Loket om je opties te bespreken.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Aanbevolen vervolgstappen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold">Bel Het Juridisch Loket</h4>
                      <p className="text-sm text-muted-foreground">
                        Gratis juridisch advies: 0900-8020. Zij kunnen je situatie beoordelen.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold">Documenteer alles</h4>
                      <p className="text-sm text-muted-foreground">
                        Gebruik onze Tijdlijnbouwer om alle gebeurtenissen vast te leggen.
                      </p>
                      <Link to="/tijdlijn" className="inline-flex items-center gap-1 text-sm text-primary mt-2">
                        Naar Tijdlijnbouwer <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {analysis.hasProtectedCharacteristic && (
                    <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold">College voor de Rechten van de Mens</h4>
                        <p className="text-sm text-muted-foreground">
                          Gratis en laagdrempelig. Zij kunnen een oordeel geven over discriminatie.
                        </p>
                        <a 
                          href="https://mensenrechten.nl" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary mt-2"
                        >
                          Bezoek mensenrechten.nl <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center pt-6">
                <Button variant="outline" onClick={handleReset}>
                  Opnieuw beginnen
                </Button>
                <Link to="/tijdlijn">
                  <Button>
                    Naar Tijdlijnbouwer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Vraag {currentStep + 1} van {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% voltooid
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
                  <CardDescription className="text-base flex items-start gap-2">
                    <Info className="w-4 h-4 mt-1 shrink-0 text-primary" />
                    {currentQuestion.explanation}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        answers[currentQuestion.id] === option.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Vorige
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="gap-2"
            >
              {currentStep === questions.length - 1 ? "Bekijk resultaten" : "Volgende"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Rechtenverkenner;
