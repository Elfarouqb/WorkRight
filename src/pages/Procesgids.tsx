import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { 
  Phone, 
  Building, 
  Scale, 
  Users, 
  Shield, 
  ExternalLink,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useLanguage } from "@/contexts/LanguageContext";

const Procesgids = () => {
  const { t } = useLanguage();

  const resources = [
    {
      name: t.resourceJuridischLoket,
      description: t.resourceJuridischLoketDesc,
      phone: "0900-8020",
      url: "https://www.juridischloket.nl",
      icon: Phone,
    },
    {
      name: t.resourceCollege,
      description: t.resourceCollegeDesc,
      url: "https://mensenrechten.nl",
      icon: Scale,
    },
    {
      name: t.resourceUwv,
      description: t.resourceUwvDesc,
      url: "https://www.uwv.nl",
      icon: Building,
    },
    {
      name: t.resourceFnv,
      description: t.resourceFnvDesc,
      url: "https://www.fnv.nl",
      icon: Users,
    },
    {
      name: t.resourceAntidiscriminatie,
      description: t.resourceAntidiscriminatieDesc,
      url: "https://discriminatie.nl",
      icon: Shield,
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: t.processStep1Title,
      description: t.processStep1Desc,
      details: [t.processStep1Detail1, t.processStep1Detail2, t.processStep1Detail3, t.processStep1Detail4],
    },
    {
      step: 2,
      title: t.processStep2Title,
      description: t.processStep2Desc,
      details: [t.processStep2Detail1, t.processStep2Detail2, t.processStep2Detail3, t.processStep2Detail4],
    },
    {
      step: 3,
      title: t.processStep3Title,
      description: t.processStep3Desc,
      details: [t.processStep3Detail1, t.processStep3Detail2, t.processStep3Detail3, t.processStep3Detail4],
    },
    {
      step: 4,
      title: t.processStep4Title,
      description: t.processStep4Desc,
      details: [t.processStep4Detail1, t.processStep4Detail2, t.processStep4Detail3, t.processStep4Detail4],
    },
  ];

  const faqItems = [
    { question: t.faq1Question, answer: t.faq1Answer },
    { question: t.faq2Question, answer: t.faq2Answer },
    { question: t.faq3Question, answer: t.faq3Answer },
    { question: t.faq4Question, answer: t.faq4Answer },
    { question: t.faq5Question, answer: t.faq5Answer },
    { question: t.faq6Question, answer: t.faq6Answer },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-heading font-bold mb-3">{t.procesgidsTitle}</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t.procesgidsSubtitle}
            </p>
          </div>

          {/* Process Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-bold mb-6">{t.procesgidsProcessTitle}</h2>
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                            {step.step}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          <ul className="space-y-2">
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-bold mb-6">{t.procesgidsResourcesTitle}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="h-full shadow-soft hover:shadow-card transition-all hover:border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="font-semibold">{resource.name}</h3>
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                            {resource.phone && (
                              <p className="text-sm font-medium text-primary mt-1">{resource.phone}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-bold mb-6">{t.procesgidsFaqTitle}</h2>
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                        <span className="text-left font-medium">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <Card className="bg-gradient-calm text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-heading font-bold mb-3">{t.procesgidsCtaTitle}</h2>
              <p className="mb-6 opacity-90">
                {t.procesgidsCtaDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/rechtenverkenner">
                  <Button variant="secondary" className="w-full sm:w-auto gap-2">
                    {t.navRechtenverkenner}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/tijdlijn">
                  <Button variant="secondary" className="w-full sm:w-auto gap-2">
                    {t.timelineBuilderTitle}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Procesgids;