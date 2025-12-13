import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { 
  Phone, 
  Building, 
  Scale, 
  FileText, 
  Users, 
  Shield, 
  ExternalLink,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/chat/ChatWidget";

const resources = [
  {
    name: "Het Juridisch Loket",
    description: "Gratis juridisch advies voor iedereen",
    phone: "0900-8020",
    url: "https://www.juridischloket.nl",
    icon: Phone,
  },
  {
    name: "College voor de Rechten van de Mens",
    description: "Beoordeelt discriminatieklachten (gratis)",
    url: "https://mensenrechten.nl",
    icon: Scale,
  },
  {
    name: "UWV",
    description: "Uitkeringen en ontslagprocedures",
    url: "https://www.uwv.nl",
    icon: Building,
  },
  {
    name: "FNV",
    description: "Vakbond met juridische ondersteuning",
    url: "https://www.fnv.nl",
    icon: Users,
  },
  {
    name: "Antidiscriminatiebureau",
    description: "Lokale hulp bij discriminatie",
    url: "https://discriminatie.nl",
    icon: Shield,
  },
];

const processSteps = [
  {
    step: 1,
    title: "Verzamel informatie",
    description: "Documenteer wat er is gebeurd, bewaar e-mails en berichten.",
    details: [
      "Schrijf zo snel mogelijk op wat er is gebeurd",
      "Bewaar alle e-mails, WhatsApp-berichten en brieven",
      "Noteer namen van getuigen",
      "Gebruik onze Tijdlijnbouwer om alles overzichtelijk te maken",
    ],
  },
  {
    step: 2,
    title: "Vraag advies",
    description: "Neem contact op met Het Juridisch Loket voor gratis advies.",
    details: [
      "Bel 0900-8020 voor gratis advies",
      "Je kunt ook langsgaan bij een spreekuur",
      "Leg je situatie uit en vraag wat je opties zijn",
      "Vraag naar termijnen die voor jou gelden",
    ],
  },
  {
    step: 3,
    title: "Kies je route",
    description: "Afhankelijk van je situatie zijn er verschillende mogelijkheden.",
    details: [
      "Bezwaar maken bij UWV (bij ontslagvergunning)",
      "Naar de kantonrechter (bij ontslag op staande voet)",
      "College voor de Rechten van de Mens (bij discriminatie)",
      "Onderhandelen met je werkgever",
    ],
  },
  {
    step: 4,
    title: "Onderneem actie",
    description: "Zet de gekozen stappen, binnen de geldende termijnen.",
    details: [
      "Vraag zo nodig WW aan",
      "Dien eventueel een klacht in",
      "Verzamel extra bewijs indien nodig",
      "Houd alle correspondentie bij",
    ],
  },
];

const faqItems = [
  {
    question: "Wat is het College voor de Rechten van de Mens?",
    answer: "Het College voor de Rechten van de Mens is een onafhankelijke instantie die oordeelt over discriminatieklachten. Het is gratis om een klacht in te dienen. Het College geeft een oordeel over of er sprake was van discriminatie. Dit oordeel is niet juridisch bindend, maar wordt vaak wel gevolgd door rechters en werkgevers.",
  },
  {
    question: "Wat doet het UWV?",
    answer: "Het UWV (Uitvoeringsinstituut Werknemersverzekeringen) beoordeelt ontslagaanvragen van werkgevers en regelt uitkeringen zoals de WW. Als je werkgever je wil ontslaan om bedrijfseconomische redenen of langdurige ziekte, moet die een vergunning aanvragen bij het UWV. Je kunt bezwaar maken tegen beslissingen van het UWV.",
  },
  {
    question: "Wat is een vaststellingsovereenkomst?",
    answer: "Een vaststellingsovereenkomst is een overeenkomst tussen jou en je werkgever over het beëindigen van je arbeidscontract. Hierin worden afspraken gemaakt over zaken als een ontslagvergoeding, opzegtermijn en getuigschrift. Let op: teken nooit zomaar! Je hebt 14 dagen bedenktijd nadat je hebt getekend.",
  },
  {
    question: "Hoe lang duurt een procedure bij de kantonrechter?",
    answer: "Een procedure bij de kantonrechter duurt gemiddeld 4 tot 8 weken. Je moet binnen 2 maanden na je ontslag een verzoekschrift indienen. De rechter plant dan een zitting, en meestal volgt binnen enkele weken een uitspraak. Bij complexe zaken kan het langer duren.",
  },
  {
    question: "Wat zijn beschermde gronden?",
    answer: "Beschermde gronden zijn kenmerken waarop je niet gediscrimineerd mag worden. In Nederland zijn dit: godsdienst, levensovertuiging, politieke gezindheid, ras, geslacht, nationaliteit, seksuele gerichtheid, burgerlijke staat, handicap of chronische ziekte, en leeftijd.",
  },
  {
    question: "Heb ik recht op een WW-uitkering?",
    answer: "Je hebt recht op WW als je: minimaal 26 weken hebt gewerkt in de 36 weken voor je werkloosheid, niet zelf ontslag hebt genomen, en beschikbaar bent voor werk. Bij ontslag op staande voet kun je mogelijk geen WW krijgen als het ontslag je eigen schuld was. Het UWV beoordeelt dit per geval.",
  },
];

const Procesgids = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-heading font-bold mb-3">Procesgids</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Begrijp hoe het Nederlandse arbeidsrechtsysteem werkt en welke stappen je kunt zetten.
            </p>
          </div>

          {/* Process Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-bold mb-6">Het proces stap voor stap</h2>
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
            <h2 className="text-2xl font-heading font-bold mb-6">Hulpbronnen</h2>
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
            <h2 className="text-2xl font-heading font-bold mb-6">Veelgestelde vragen</h2>
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
              <h2 className="text-2xl font-heading font-bold mb-3">Klaar om te beginnen?</h2>
              <p className="mb-6 opacity-90">
                Gebruik onze tools om je situatie in kaart te brengen en je voor te bereiden.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/rechtenverkenner">
                  <Button variant="secondary" className="w-full sm:w-auto gap-2">
                    Rechtenverkenner
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/tijdlijn">
                  <Button variant="secondary" className="w-full sm:w-auto gap-2">
                    Tijdlijnbouwer
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
