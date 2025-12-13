import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'nl' | 'en';

interface Translations {
  // Header
  navRechtenverkenner: string;
  navTijdlijn: string;
  navTermijnen: string;
  navProcesgids: string;
  myTimeline: string;
  login: string;
  logout: string;
  openMenu: string;
  closeMenu: string;
  
  // Hero
  freeAndConfidential: string;
  heroTitle: string;
  heroSubtitle: string;
  getHelp: string;
  voiceOrText: string;
  startRightsExplorer: string;
  viewProcessGuide: string;
  noJudgment: string;
  weListen: string;
  deadlineAlerts: string;
  neverLate: string;
  private100: string;
  yourData: string;
  
  // Process Steps
  howItWorks: string;
  stepByStep: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  
  // Protected Characteristics
  protectedCharacteristics: string;
  protectedCharacteristicsDesc: string;
  disability: string;
  raceEthnicity: string;
  genderSex: string;
  age: string;
  religionBelief: string;
  pregnancy: string;
  moreCharacteristics: string;
  
  // Features
  toolsToHelp: string;
  toolsDesc: string;
  rightsExplorerDesc: string;
  timelineBuilderTitle: string;
  timelineBuilderDesc: string;
  deadlineCalculatorTitle: string;
  deadlineCalculatorDesc: string;
  processGuideDesc: string;
  view: string;
  
  // Deadline Alert
  deadlinesMatter: string;
  deadlinesDesc: string;
  calculateMyDeadlines: string;
  
  // Reassurance
  ourPromise: string;
  hereToHelp: string;
  hereToHelpDesc: string;
  supportNotReplace: string;
  supportNotReplaceDesc: string;
  humanHelpAvailable: string;
  humanHelpAvailableDesc: string;
  privacyMatters: string;
  privacyMattersDesc: string;
  notAlone: string;
  notAloneDesc: string;
  
  // Footer
  footerDesc: string;
  footerDisclaimer: string;
  tools: string;
  resources: string;
  footerCopyright: string;
}

const translations: Record<Language, Translations> = {
  nl: {
    // Header
    navRechtenverkenner: 'Rechtenverkenner',
    navTijdlijn: 'Tijdlijn',
    navTermijnen: 'Termijnen',
    navProcesgids: 'Procesgids',
    myTimeline: 'Mijn tijdlijn',
    login: 'Inloggen',
    logout: 'Uitloggen',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
    
    // Hero
    freeAndConfidential: 'Gratis en vertrouwelijk',
    heroTitle: 'Begrijp je rechten na ontslag',
    heroSubtitle: 'Ontslagen en vermoed je discriminatie? Wij helpen je stap voor stap. Geen juridische taal, geen oordeel - gewoon duidelijke uitleg en praktische hulp.',
    getHelp: 'Vraag hulp',
    voiceOrText: '(spraak of tekst)',
    startRightsExplorer: 'Start de Rechtenverkenner',
    viewProcessGuide: 'Bekijk de Procesgids',
    noJudgment: 'Geen oordeel',
    weListen: 'We luisteren',
    deadlineAlerts: 'Termijn-alerts',
    neverLate: 'Nooit te laat',
    private100: '100% privé',
    yourData: 'Jouw gegevens',
    
    // Process Steps
    howItWorks: 'Hoe het werkt',
    stepByStep: 'Stap voor stap naar duidelijkheid. Op je eigen tempo.',
    step1Title: 'Verken je situatie',
    step1Desc: 'Beantwoord vragen over wat er is gebeurd. Geen juridische taal, gewoon simpele vragen.',
    step2Title: 'Documenteer alles',
    step2Desc: 'Bouw een tijdlijn van gebeurtenissen. Dit helpt bij gesprekken met adviseurs.',
    step3Title: 'Begrijp je opties',
    step3Desc: 'Leer welke stappen je kunt zetten en welke termijnen belangrijk zijn.',
    step4Title: 'Zoek hulp',
    step4Desc: 'Neem contact op met Het Juridisch Loket of andere hulpbronnen met een duidelijk verhaal.',
    
    // Protected Characteristics
    protectedCharacteristics: 'Beschermde kenmerken',
    protectedCharacteristicsDesc: 'In Nederland mag je niet gediscrimineerd worden op basis van deze kenmerken.',
    disability: 'Handicap of ziekte',
    raceEthnicity: 'Afkomst of ras',
    genderSex: 'Geslacht of gender',
    age: 'Leeftijd',
    religionBelief: 'Godsdienst of overtuiging',
    pregnancy: 'Zwangerschap',
    moreCharacteristics: 'En meer: seksuele gerichtheid, burgerlijke staat, nationaliteit, politieke gezindheid',
    
    // Features
    toolsToHelp: 'Tools die je helpen',
    toolsDesc: 'Alles wat je nodig hebt om je situatie te begrijpen en je voor te bereiden.',
    rightsExplorerDesc: 'Beantwoord eenvoudige vragen en ontdek of wat jou is overkomen discriminatie kan zijn.',
    timelineBuilderTitle: 'Tijdlijnbouwer',
    timelineBuilderDesc: 'Documenteer gebeurtenissen stap voor stap. Handig voor gesprekken met adviseurs.',
    deadlineCalculatorTitle: 'Termijnberekener',
    deadlineCalculatorDesc: 'Bereken belangrijke deadlines en vergeet nooit een termijn.',
    processGuideDesc: 'Begrijp hoe het Nederlandse systeem werkt, met links naar hulpbronnen.',
    view: 'Bekijken',
    
    // Deadline Alert
    deadlinesMatter: 'Termijnen zijn belangrijk',
    deadlinesDesc: 'In Nederland heb je vaak beperkte tijd om actie te ondernemen. Bijvoorbeeld: bezwaar bij het UWV moet binnen <strong>6 weken</strong>. Weet jij wanneer jouw termijnen aflopen?',
    calculateMyDeadlines: 'Bereken mijn termijnen',
    
    // Reassurance
    ourPromise: 'ONZE BELOFTE',
    hereToHelp: 'Hier om te helpen, niet te overweldigen',
    hereToHelpDesc: 'We begrijpen dat dit een moeilijke tijd is. We hebben deze tool met zorg ontworpen, met jouw welzijn in gedachten.',
    supportNotReplace: 'We ondersteunen, niet vervangen',
    supportNotReplaceDesc: 'Deze tool helpt je te begrijpen en voor te bereiden. Het vervangt geen juridisch advies. Spreek altijd met een professional voordat je beslissingen neemt.',
    humanHelpAvailable: 'Menselijke hulp beschikbaar',
    humanHelpAvailableDesc: 'Het Juridisch Loket, vakbonden en arbeidsrechtadvocaten kunnen de deskundige ondersteuning bieden die je nodig hebt. Wij wijzen je de weg.',
    privacyMatters: 'Je privacy is belangrijk',
    privacyMattersDesc: 'We slaan je persoonlijke gegevens niet op. Wat je deelt, blijft bij jou. Jij hebt de controle.',
    notAlone: 'Je staat er niet alleen voor',
    notAloneDesc: 'Veel mensen maken dit mee. Het is oké om je overweldigd te voelen. Neem pauzes. Kom terug wanneer je er klaar voor bent.',
    
    // Footer
    footerDesc: 'Gratis hulp voor werknemers die discriminatie vermoeden. Wij helpen je je rechten te begrijpen en je voor te bereiden op het proces.',
    footerDisclaimer: 'Dit is een hulpmiddel, geen juridisch advies. Neem altijd contact op met een professional.',
    tools: 'Tools',
    resources: 'Hulpbronnen',
    footerCopyright: 'Met zorg gemaakt voor iedereen.',
  },
  en: {
    // Header
    navRechtenverkenner: 'Rights Explorer',
    navTijdlijn: 'Timeline',
    navTermijnen: 'Deadlines',
    navProcesgids: 'Process Guide',
    myTimeline: 'My timeline',
    login: 'Login',
    logout: 'Logout',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    
    // Hero
    freeAndConfidential: 'Free and confidential',
    heroTitle: 'Understand your rights after dismissal',
    heroSubtitle: 'Dismissed and suspect discrimination? We help you step by step. No legal jargon, no judgment - just clear explanations and practical help.',
    getHelp: 'Get help',
    voiceOrText: '(voice or text)',
    startRightsExplorer: 'Start the Rights Explorer',
    viewProcessGuide: 'View the Process Guide',
    noJudgment: 'No judgment',
    weListen: 'We listen',
    deadlineAlerts: 'Deadline alerts',
    neverLate: 'Never late',
    private100: '100% private',
    yourData: 'Your data',
    
    // Process Steps
    howItWorks: 'How it works',
    stepByStep: 'Step by step to clarity. At your own pace.',
    step1Title: 'Explore your situation',
    step1Desc: 'Answer questions about what happened. No legal jargon, just simple questions.',
    step2Title: 'Document everything',
    step2Desc: 'Build a timeline of events. This helps in conversations with advisors.',
    step3Title: 'Understand your options',
    step3Desc: 'Learn what steps you can take and which deadlines are important.',
    step4Title: 'Seek help',
    step4Desc: 'Contact the Juridisch Loket or other resources with a clear story.',
    
    // Protected Characteristics
    protectedCharacteristics: 'Protected characteristics',
    protectedCharacteristicsDesc: 'In the Netherlands, you may not be discriminated against based on these characteristics.',
    disability: 'Disability or illness',
    raceEthnicity: 'Race or ethnicity',
    genderSex: 'Sex or gender',
    age: 'Age',
    religionBelief: 'Religion or belief',
    pregnancy: 'Pregnancy',
    moreCharacteristics: 'And more: sexual orientation, marital status, nationality, political opinion',
    
    // Features
    toolsToHelp: 'Tools to help you',
    toolsDesc: 'Everything you need to understand your situation and prepare.',
    rightsExplorerDesc: 'Answer simple questions and discover if what happened to you could be discrimination.',
    timelineBuilderTitle: 'Timeline Builder',
    timelineBuilderDesc: 'Document events step by step. Useful for conversations with advisors.',
    deadlineCalculatorTitle: 'Deadline Calculator',
    deadlineCalculatorDesc: 'Calculate important deadlines and never miss a deadline.',
    processGuideDesc: 'Understand how the Dutch system works, with links to resources.',
    view: 'View',
    
    // Deadline Alert
    deadlinesMatter: 'Deadlines matter',
    deadlinesDesc: 'In the Netherlands, you often have limited time to take action. For example: objection to UWV must be within <strong>6 weeks</strong>. Do you know when your deadlines expire?',
    calculateMyDeadlines: 'Calculate my deadlines',
    
    // Reassurance
    ourPromise: 'OUR PROMISE',
    hereToHelp: 'Here to help, not to overwhelm',
    hereToHelpDesc: 'We understand this is a difficult time. We\'ve designed this tool with care, keeping your wellbeing in mind.',
    supportNotReplace: 'We support, not replace',
    supportNotReplaceDesc: 'This tool helps you understand and prepare. It does not replace legal advice. Always speak to a professional before making decisions.',
    humanHelpAvailable: 'Human help is available',
    humanHelpAvailableDesc: 'The Juridisch Loket, unions, and employment lawyers can provide the expert support you need. We\'ll point you in the right direction.',
    privacyMatters: 'Your privacy matters',
    privacyMattersDesc: 'We don\'t store your personal information. What you share stays with you. You\'re in control.',
    notAlone: 'You\'re not alone',
    notAloneDesc: 'Many people go through this. It\'s okay to feel overwhelmed. Take breaks. Come back when you\'re ready.',
    
    // Footer
    footerDesc: 'Free help for employees who suspect discrimination. We help you understand your rights and prepare for the process.',
    footerDisclaimer: 'This is a tool, not legal advice. Always contact a professional.',
    tools: 'Tools',
    resources: 'Resources',
    footerCopyright: 'Made with care for everyone.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'nl';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
