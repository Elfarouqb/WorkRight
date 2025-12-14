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
import { useLanguage } from "@/contexts/LanguageContext";

const Rechtenverkenner = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: "employment",
      question: t.q1Question,
      explanation: t.q1Explanation,
      options: [
        { value: "vast", label: t.q1Opt1, description: t.q1Opt1Desc },
        { value: "tijdelijk", label: t.q1Opt2, description: t.q1Opt2Desc },
        { value: "uitzend", label: t.q1Opt3, description: t.q1Opt3Desc },
        { value: "zzp", label: t.q1Opt4, description: t.q1Opt4Desc },
        { value: "weet_niet", label: t.q1Opt5, description: t.q1Opt5Desc },
      ],
    },
    {
      id: "dismissal_type",
      question: t.q2Question,
      explanation: t.q2Explanation,
      options: [
        { value: "op_staande_voet", label: t.q2Opt1, description: t.q2Opt1Desc },
        { value: "met_opzegtermijn", label: t.q2Opt2, description: t.q2Opt2Desc },
        { value: "contract_niet_verlengd", label: t.q2Opt3, description: t.q2Opt3Desc },
        { value: "vaststellingsovereenkomst", label: t.q2Opt4, description: t.q2Opt4Desc },
        { value: "anders", label: t.q2Opt5, description: t.q2Opt5Desc },
      ],
    },
    {
      id: "protected_characteristic",
      question: t.q3Question,
      explanation: t.q3Explanation,
      options: [
        { value: "gezondheid", label: t.q3Opt1, description: t.q3Opt1Desc },
        { value: "afkomst", label: t.q3Opt2, description: t.q3Opt2Desc },
        { value: "geslacht", label: t.q3Opt3, description: t.q3Opt3Desc },
        { value: "leeftijd", label: t.q3Opt4, description: t.q3Opt4Desc },
        { value: "godsdienst", label: t.q3Opt5, description: t.q3Opt5Desc },
        { value: "seksuele_gerichtheid", label: t.q3Opt6, description: t.q3Opt6Desc },
        { value: "zwangerschap", label: t.q3Opt7, description: t.q3Opt7Desc },
        { value: "meerdere", label: t.q3Opt8, description: t.q3Opt8Desc },
        { value: "geen", label: t.q3Opt9, description: t.q3Opt9Desc },
      ],
    },
    {
      id: "evidence",
      question: t.q4Question,
      explanation: t.q4Explanation,
      options: [
        { value: "schriftelijk", label: t.q4Opt1, description: t.q4Opt1Desc },
        { value: "getuigen", label: t.q4Opt2, description: t.q4Opt2Desc },
        { value: "patroon", label: t.q4Opt3, description: t.q4Opt3Desc },
        { value: "geen", label: t.q4Opt4, description: t.q4Opt4Desc },
        { value: "weet_niet", label: t.q4Opt5, description: t.q4Opt5Desc },
      ],
    },
    {
      id: "timeframe",
      question: t.q5Question,
      explanation: t.q5Explanation,
      options: [
        { value: "week", label: t.q5Opt1, description: t.q5Opt1Desc },
        { value: "maand", label: t.q5Opt2, description: t.q5Opt2Desc },
        { value: "drie_maanden", label: t.q5Opt3, description: t.q5Opt3Desc },
        { value: "langer", label: t.q5Opt4, description: t.q5Opt4Desc },
        { value: "weet_niet", label: t.q5Opt5, description: t.q5Opt5Desc },
      ],
    },
  ];

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
                <h1 className="text-3xl font-heading font-bold">{t.rechtenverkennerResultsTitle}</h1>
                <p className="text-lg text-muted-foreground">
                  {t.rechtenverkennerResultsSubtitle}
                </p>
              </div>

              {analysis.hasProtectedCharacteristic && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{t.rechtenverkennerPossibleDiscrimination}</h3>
                        <p className="text-muted-foreground">
                          {t.rechtenverkennerPossibleDiscriminationDesc}
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
                        <h3 className="font-semibold text-lg mb-2">{t.rechtenverkennerDeadlineWarning}</h3>
                        <p className="text-muted-foreground">
                          {t.rechtenverkennerDeadlineWarningDesc}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{t.rechtenverkennerRecommendedSteps}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold">{t.rechtenverkennerStep1Title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t.rechtenverkennerStep1Desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold">{t.rechtenverkennerStep2Title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t.rechtenverkennerStep2Desc}
                      </p>
                      <Link to="/tijdlijn" className="inline-flex items-center gap-1 text-sm text-primary mt-2">
                        {t.rechtenverkennerToTimeline} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {analysis.hasProtectedCharacteristic && (
                    <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold">{t.rechtenverkennerStep3Title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t.rechtenverkennerStep3Desc}
                        </p>
                        <a 
                          href="https://mensenrechten.nl" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary mt-2"
                        >
                          mensenrechten.nl <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center pt-6">
                <Button variant="outline" onClick={handleReset}>
                  {t.rechtenverkennerStartOver}
                </Button>
                <Link to="/tijdlijn">
                  <Button>
                    {t.rechtenverkennerToTimeline}
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
                {t.rechtenverkennerQuestion} {currentStep + 1} / {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% {t.rechtenverkennerCompleted}
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
              {t.rechtenverkennerPrevious}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="gap-2"
            >
              {currentStep === questions.length - 1 ? t.rechtenverkennerViewResults : t.rechtenverkennerNext}
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