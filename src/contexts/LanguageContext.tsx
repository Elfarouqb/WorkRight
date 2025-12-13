import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "nl" | "en";

interface Translations {
  [key: string]: {
    nl: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  "nav.rechtenverkenner": { nl: "Rechtenverkenner", en: "Rights Explorer" },
  "nav.tijdlijn": { nl: "Tijdlijn", en: "Timeline" },
  "nav.termijnen": { nl: "Termijnen", en: "Deadlines" },
  "nav.procesgids": { nl: "Procesgids", en: "Process Guide" },
  "nav.login": { nl: "Inloggen", en: "Login" },
  "nav.logout": { nl: "Uitloggen", en: "Logout" },
  "nav.myTimeline": { nl: "Mijn tijdlijn", en: "My Timeline" },
  "nav.menuOpen": { nl: "Menu openen", en: "Open menu" },
  "nav.menuClose": { nl: "Menu sluiten", en: "Close menu" },

  // Hero
  "hero.badge": { nl: "Gratis en vertrouwelijk", en: "Free and confidential" },
  "hero.title": { nl: "Begrijp je rechten na ontslag", en: "Understand your rights after dismissal" },
  "hero.subtitle": { 
    nl: "Ontslagen en vermoed je discriminatie? Wij helpen je stap voor stap. Geen juridische taal, geen oordeel - gewoon duidelijke uitleg en praktische hulp.",
    en: "Dismissed and suspect discrimination? We help you step by step. No legal jargon, no judgment - just clear explanations and practical help."
  },
  "hero.getHelp": { nl: "Vraag hulp", en: "Get help" },
  "hero.voiceOrText": { nl: "(spraak of tekst)", en: "(voice or text)" },
  "hero.startExplorer": { nl: "Start de Rechtenverkenner", en: "Start the Rights Explorer" },
  "hero.viewGuide": { nl: "Bekijk de Procesgids", en: "View the Process Guide" },
  "hero.noJudgment": { nl: "Geen oordeel", en: "No judgment" },
  "hero.weListen": { nl: "We luisteren", en: "We listen" },
  "hero.deadlineAlerts": { nl: "Termijn-alerts", en: "Deadline alerts" },
  "hero.neverLate": { nl: "Nooit te laat", en: "Never too late" },
  "hero.private": { nl: "100% privé", en: "100% private" },
  "hero.yourData": { nl: "Jouw gegevens", en: "Your data" },

  // Process Steps
  "steps.title": { nl: "Hoe het werkt", en: "How it works" },
  "steps.subtitle": { nl: "Stap voor stap naar duidelijkheid. Op je eigen tempo.", en: "Step by step to clarity. At your own pace." },
  "steps.step1.title": { nl: "Verken je situatie", en: "Explore your situation" },
  "steps.step1.desc": { nl: "Beantwoord vragen over wat er is gebeurd. Geen juridische taal, gewoon simpele vragen.", en: "Answer questions about what happened. No legal jargon, just simple questions." },
  "steps.step2.title": { nl: "Documenteer alles", en: "Document everything" },
  "steps.step2.desc": { nl: "Bouw een tijdlijn van gebeurtenissen. Dit helpt bij gesprekken met adviseurs.", en: "Build a timeline of events. This helps when talking to advisors." },
  "steps.step3.title": { nl: "Begrijp je opties", en: "Understand your options" },
  "steps.step3.desc": { nl: "Leer welke stappen je kunt zetten en welke termijnen belangrijk zijn.", en: "Learn what steps you can take and which deadlines matter." },
  "steps.step4.title": { nl: "Zoek hulp", en: "Seek help" },
  "steps.step4.desc": { nl: "Neem contact op met Het Juridisch Loket of andere hulpbronnen met een duidelijk verhaal.", en: "Contact legal aid or other resources with a clear story." },

  // Protected Characteristics
  "characteristics.title": { nl: "Beschermde kenmerken", en: "Protected characteristics" },
  "characteristics.subtitle": { 
    nl: "In Nederland mag je niet gediscrimineerd worden op basis van deze kenmerken.",
    en: "In the Netherlands, you cannot be discriminated against based on these characteristics."
  },
  "characteristics.disability": { nl: "Handicap of ziekte", en: "Disability or illness" },
  "characteristics.race": { nl: "Afkomst of ras", en: "Origin or race" },
  "characteristics.gender": { nl: "Geslacht of gender", en: "Sex or gender" },
  "characteristics.age": { nl: "Leeftijd", en: "Age" },
  "characteristics.religion": { nl: "Godsdienst of overtuiging", en: "Religion or belief" },
  "characteristics.pregnancy": { nl: "Zwangerschap", en: "Pregnancy" },
  "characteristics.more": { 
    nl: "En meer: seksuele gerichtheid, burgerlijke staat, nationaliteit, politieke gezindheid",
    en: "And more: sexual orientation, marital status, nationality, political opinion"
  },

  // Features
  "features.title": { nl: "Tools die je helpen", en: "Tools to help you" },
  "features.subtitle": { 
    nl: "Alles wat je nodig hebt om je situatie te begrijpen en je voor te bereiden.",
    en: "Everything you need to understand your situation and prepare."
  },
  "features.explorer.title": { nl: "Rechtenverkenner", en: "Rights Explorer" },
  "features.explorer.desc": { 
    nl: "Beantwoord eenvoudige vragen en ontdek of wat jou is overkomen discriminatie kan zijn.",
    en: "Answer simple questions and discover if what happened to you could be discrimination."
  },
  "features.timeline.title": { nl: "Tijdlijnbouwer", en: "Timeline Builder" },
  "features.timeline.desc": { 
    nl: "Documenteer gebeurtenissen stap voor stap. Handig voor gesprekken met adviseurs.",
    en: "Document events step by step. Useful for conversations with advisors."
  },
  "features.deadline.title": { nl: "Termijnberekener", en: "Deadline Calculator" },
  "features.deadline.desc": { 
    nl: "Bereken belangrijke deadlines en vergeet nooit een termijn.",
    en: "Calculate important deadlines and never miss a deadline."
  },
  "features.guide.title": { nl: "Procesgids", en: "Process Guide" },
  "features.guide.desc": { 
    nl: "Begrijp hoe het Nederlandse systeem werkt, met links naar hulpbronnen.",
    en: "Understand how the Dutch system works, with links to resources."
  },
  "features.view": { nl: "Bekijken", en: "View" },

  // Deadline Alert
  "deadline.title": { nl: "Termijnen zijn belangrijk", en: "Deadlines are important" },
  "deadline.text": { 
    nl: "In Nederland heb je vaak beperkte tijd om actie te ondernemen. Bijvoorbeeld: bezwaar bij het UWV moet binnen",
    en: "In the Netherlands, you often have limited time to take action. For example: objections to UWV must be filed within"
  },
  "deadline.weeks": { nl: "6 weken", en: "6 weeks" },
  "deadline.question": { 
    nl: "Weet jij wanneer jouw termijnen aflopen?",
    en: "Do you know when your deadlines expire?"
  },
  "deadline.calculate": { nl: "Bereken mijn termijnen", en: "Calculate my deadlines" },

  // Reassurance
  "reassurance.label": { nl: "ONZE BELOFTE", en: "OUR PROMISE" },
  "reassurance.title": { nl: "Hier om te helpen, niet te overweldigen", en: "Here to help, not to overwhelm" },
  "reassurance.subtitle": { 
    nl: "We begrijpen dat dit een moeilijke tijd is. We hebben deze tool met zorg ontworpen, met jouw welzijn in gedachten.",
    en: "We understand this is a difficult time. We've designed this tool with care, keeping your wellbeing in mind."
  },
  "reassurance.support.title": { nl: "We ondersteunen, vervangen niet", en: "We support, not replace" },
  "reassurance.support.desc": { 
    nl: "Deze tool helpt je begrijpen en voorbereiden. Het vervangt geen juridisch advies. Spreek altijd met een professional voordat je beslissingen neemt.",
    en: "This tool helps you understand and prepare. It does not replace legal advice. Always speak to a professional before making decisions."
  },
  "reassurance.human.title": { nl: "Menselijke hulp is beschikbaar", en: "Human help is available" },
  "reassurance.human.desc": { 
    nl: "Het Juridisch Loket, het College voor de Rechten van de Mens en advocaten kunnen de deskundige ondersteuning bieden die je nodig hebt.",
    en: "Legal aid offices and human rights organizations can provide the expert support you need. We'll point you in the right direction."
  },
  "reassurance.privacy.title": { nl: "Jouw privacy telt", en: "Your privacy matters" },
  "reassurance.privacy.desc": { 
    nl: "We slaan je persoonlijke gegevens niet op. Wat je deelt blijft bij jou. Jij hebt de controle.",
    en: "We don't store your personal information. What you share stays with you. You're in control."
  },
  "reassurance.alone.title": { nl: "Je bent niet alleen", en: "You're not alone" },
  "reassurance.alone.desc": { 
    nl: "Veel mensen maken dit mee. Het is oké om je overweldigd te voelen. Neem pauzes. Kom terug wanneer je er klaar voor bent.",
    en: "Many people go through this. It's okay to feel overwhelmed. Take breaks. Come back when you're ready."
  },

  // Footer
  "footer.description": { 
    nl: "Gratis hulp voor werknemers die discriminatie vermoeden. Wij helpen je je rechten te begrijpen en je voor te bereiden op het proces.",
    en: "Free help for employees who suspect discrimination. We help you understand your rights and prepare for the process."
  },
  "footer.disclaimer": { 
    nl: "Dit is een hulpmiddel, geen juridisch advies. Neem altijd contact op met een professional.",
    en: "This is a support tool, not legal advice. Always contact a professional."
  },
  "footer.tools": { nl: "Tools", en: "Tools" },
  "footer.resources": { nl: "Hulpbronnen", en: "Resources" },
  "footer.copyright": { 
    nl: "Met zorg gemaakt voor iedereen.",
    en: "Made with care for everyone."
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "nl";
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
