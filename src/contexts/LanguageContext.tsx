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

  // Rechtenverkenner page
  rechtenverkennerQuestion: string;
  rechtenverkennerCompleted: string;
  rechtenverkennerPrevious: string;
  rechtenverkennerNext: string;
  rechtenverkennerViewResults: string;
  rechtenverkennerResultsTitle: string;
  rechtenverkennerResultsSubtitle: string;
  rechtenverkennerPossibleDiscrimination: string;
  rechtenverkennerPossibleDiscriminationDesc: string;
  rechtenverkennerDeadlineWarning: string;
  rechtenverkennerDeadlineWarningDesc: string;
  rechtenverkennerRecommendedSteps: string;
  rechtenverkennerStep1Title: string;
  rechtenverkennerStep1Desc: string;
  rechtenverkennerStep2Title: string;
  rechtenverkennerStep2Desc: string;
  rechtenverkennerStep3Title: string;
  rechtenverkennerStep3Desc: string;
  rechtenverkennerStartOver: string;
  rechtenverkennerToTimeline: string;
  // Question content
  q1Question: string;
  q1Explanation: string;
  q1Opt1: string;
  q1Opt1Desc: string;
  q1Opt2: string;
  q1Opt2Desc: string;
  q1Opt3: string;
  q1Opt3Desc: string;
  q1Opt4: string;
  q1Opt4Desc: string;
  q1Opt5: string;
  q1Opt5Desc: string;
  q2Question: string;
  q2Explanation: string;
  q2Opt1: string;
  q2Opt1Desc: string;
  q2Opt2: string;
  q2Opt2Desc: string;
  q2Opt3: string;
  q2Opt3Desc: string;
  q2Opt4: string;
  q2Opt4Desc: string;
  q2Opt5: string;
  q2Opt5Desc: string;
  q3Question: string;
  q3Explanation: string;
  q3Opt1: string;
  q3Opt1Desc: string;
  q3Opt2: string;
  q3Opt2Desc: string;
  q3Opt3: string;
  q3Opt3Desc: string;
  q3Opt4: string;
  q3Opt4Desc: string;
  q3Opt5: string;
  q3Opt5Desc: string;
  q3Opt6: string;
  q3Opt6Desc: string;
  q3Opt7: string;
  q3Opt7Desc: string;
  q3Opt8: string;
  q3Opt8Desc: string;
  q3Opt9: string;
  q3Opt9Desc: string;
  q4Question: string;
  q4Explanation: string;
  q4Opt1: string;
  q4Opt1Desc: string;
  q4Opt2: string;
  q4Opt2Desc: string;
  q4Opt3: string;
  q4Opt3Desc: string;
  q4Opt4: string;
  q4Opt4Desc: string;
  q4Opt5: string;
  q4Opt5Desc: string;
  q5Question: string;
  q5Explanation: string;
  q5Opt1: string;
  q5Opt1Desc: string;
  q5Opt2: string;
  q5Opt2Desc: string;
  q5Opt3: string;
  q5Opt3Desc: string;
  q5Opt4: string;
  q5Opt4Desc: string;
  q5Opt5: string;
  q5Opt5Desc: string;

  // Tijdlijn page
  tijdlijnTitle: string;
  tijdlijnSubtitle: string;
  tijdlijnExport: string;
  tijdlijnAdd: string;
  tijdlijnEmpty: string;
  tijdlijnEmptyDesc: string;
  tijdlijnFirstEvent: string;
  tijdlijnLoginTitle: string;
  tijdlijnLoginDesc: string;
  tijdlijnLoginButton: string;
  tijdlijnBackHome: string;
  tijdlijnNewEvent: string;
  tijdlijnEditEvent: string;
  tijdlijnEventDesc: string;
  tijdlijnDate: string;
  tijdlijnType: string;
  tijdlijnShortTitle: string;
  tijdlijnTitlePlaceholder: string;
  tijdlijnWhatHappened: string;
  tijdlijnWhatHappenedPlaceholder: string;
  tijdlijnWhoInvolved: string;
  tijdlijnWhoInvolvedPlaceholder: string;
  tijdlijnEvidence: string;
  tijdlijnEvidencePlaceholder: string;
  tijdlijnCancel: string;
  tijdlijnSave: string;
  tijdlijnUpdate: string;
  tijdlijnInvolved: string;
  tijdlijnEvidenceLabel: string;
  tijdlijnDeleteConfirm: string;
  tijdlijnEventUpdated: string;
  tijdlijnEventAdded: string;
  tijdlijnEventDeleted: string;
  tijdlijnExported: string;
  tijdlijnLoadError: string;
  tijdlijnSaveError: string;
  tijdlijnDeleteError: string;
  // Event types
  eventTypeIncident: string;
  eventTypeConversation: string;
  eventTypeDocument: string;
  eventTypeWitness: string;
  eventTypeOther: string;

  // Termijnen page
  termijnenTitle: string;
  termijnenSubtitle: string;
  termijnenInputTitle: string;
  termijnenInputDesc: string;
  termijnenDismissalDate: string;
  termijnenCalculate: string;
  termijnenYourDeadlines: string;
  termijnenExpired: string;
  termijnenDaysLeft: string;
  termijnenImportant: string;
  termijnenImportantDesc: string;
  termijnenEmptyTitle: string;
  termijnenEmptyDesc: string;
  // Deadline names and descriptions
  deadlineUwv: string;
  deadlineUwvDesc: string;
  deadlineCourt: string;
  deadlineCourtDesc: string;
  deadlineWw: string;
  deadlineWwDesc: string;
  deadlineHumanRights: string;
  deadlineHumanRightsDesc: string;
  deadlineClaim: string;
  deadlineClaimDesc: string;

  // Procesgids page
  procesgidsTitle: string;
  procesgidsSubtitle: string;
  procesgidsProcessTitle: string;
  procesgidsResourcesTitle: string;
  procesgidsFaqTitle: string;
  procesgidsCtaTitle: string;
  procesgidsCtaDesc: string;
  // Process steps
  processStep1Title: string;
  processStep1Desc: string;
  processStep1Detail1: string;
  processStep1Detail2: string;
  processStep1Detail3: string;
  processStep1Detail4: string;
  processStep2Title: string;
  processStep2Desc: string;
  processStep2Detail1: string;
  processStep2Detail2: string;
  processStep2Detail3: string;
  processStep2Detail4: string;
  processStep3Title: string;
  processStep3Desc: string;
  processStep3Detail1: string;
  processStep3Detail2: string;
  processStep3Detail3: string;
  processStep3Detail4: string;
  processStep4Title: string;
  processStep4Desc: string;
  processStep4Detail1: string;
  processStep4Detail2: string;
  processStep4Detail3: string;
  processStep4Detail4: string;
  // Resources
  resourceJuridischLoket: string;
  resourceJuridischLoketDesc: string;
  resourceCollege: string;
  resourceCollegeDesc: string;
  resourceUwv: string;
  resourceUwvDesc: string;
  resourceFnv: string;
  resourceFnvDesc: string;
  resourceAntidiscriminatie: string;
  resourceAntidiscriminatieDesc: string;
  // FAQ
  faq1Question: string;
  faq1Answer: string;
  faq2Question: string;
  faq2Answer: string;
  faq3Question: string;
  faq3Answer: string;
  faq4Question: string;
  faq4Answer: string;
  faq5Question: string;
  faq5Answer: string;
  faq6Question: string;
  faq6Answer: string;

  // Hulp page
  hulpTitle: string;
  hulpSubtitle: string;
  hulpVideoAssistant: string;
  hulpTextChat: string;
  hulpChatSubtitle: string;
  hulpWelcome: string;
  hulpWelcomeDesc: string;
  hulpSuggestionIntro: string;
  hulpThinking: string;
  hulpErrorMessage: string;
  hulpTryAgain: string;
  hulpInputPlaceholder: string;
  hulpDisclaimer: string;
  hulpDisclaimerTitle: string;
  hulpDisclaimerDesc: string;
  hulpHumanTitle: string;
  hulpPrivacyNote: string;
  hulpSummaryTitle: string;
  hulpSummaryDesc: string;
  hulpSummaryQuestion: string;
  hulpNoThanks: string;
  hulpSend: string;
  hulpEmailPlaceholder: string;
  hulpSummarySent: string;
  hulpSummarySentDesc: string;
  // Suggested questions
  hulpQ1: string;
  hulpQ2: string;
  hulpQ3: string;
  hulpQ4: string;

  // Accessibility
  accessibilityTitle: string;
  narratorMode: string;
  narratorModeDesc: string;
  narratorEnabled: string;
  narratorDisabled: string;
  narratorPlay: string;
  narratorStop: string;
  readingFont: string;
  readingFontDesc: string;
  fontStandard: string;
  fontDyslexia: string;
  textSize: string;
  textSizeDesc: string;
  textSizeStandard: string;
  textSizeLarge: string;
  textSizeLarger: string;
  preferencesSaved: string;
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

    // Rechtenverkenner page
    rechtenverkennerQuestion: 'Vraag',
    rechtenverkennerCompleted: 'voltooid',
    rechtenverkennerPrevious: 'Vorige',
    rechtenverkennerNext: 'Volgende',
    rechtenverkennerViewResults: 'Bekijk resultaten',
    rechtenverkennerResultsTitle: 'Je antwoorden zijn bekeken',
    rechtenverkennerResultsSubtitle: 'Op basis van wat je hebt verteld, zijn hier onze suggesties.',
    rechtenverkennerPossibleDiscrimination: 'Mogelijke discriminatie',
    rechtenverkennerPossibleDiscriminationDesc: 'Op basis van je antwoorden lijkt het erop dat je ontslag mogelijk te maken heeft met een beschermd kenmerk. Dit kan discriminatie zijn volgens de wet.',
    rechtenverkennerDeadlineWarning: 'Let op de termijnen',
    rechtenverkennerDeadlineWarningDesc: 'Als je ontslag langer geleden was, zijn sommige termijnen mogelijk verlopen. Neem snel contact op met Het Juridisch Loket om je opties te bespreken.',
    rechtenverkennerRecommendedSteps: 'Aanbevolen vervolgstappen',
    rechtenverkennerStep1Title: 'Bel Het Juridisch Loket',
    rechtenverkennerStep1Desc: 'Gratis juridisch advies: 0900-8020. Zij kunnen je situatie beoordelen.',
    rechtenverkennerStep2Title: 'Documenteer alles',
    rechtenverkennerStep2Desc: 'Gebruik onze Tijdlijnbouwer om alle gebeurtenissen vast te leggen.',
    rechtenverkennerStep3Title: 'College voor de Rechten van de Mens',
    rechtenverkennerStep3Desc: 'Gratis en laagdrempelig. Zij kunnen een oordeel geven over discriminatie.',
    rechtenverkennerStartOver: 'Opnieuw beginnen',
    rechtenverkennerToTimeline: 'Naar Tijdlijnbouwer',
    // Question content
    q1Question: 'Wat was je arbeidssituatie?',
    q1Explanation: 'Dit helpt ons te begrijpen welke regels op jouw situatie van toepassing zijn.',
    q1Opt1: 'Vast contract',
    q1Opt1Desc: 'Contract voor onbepaalde tijd',
    q1Opt2: 'Tijdelijk contract',
    q1Opt2Desc: 'Contract voor bepaalde tijd',
    q1Opt3: 'Uitzendwerk',
    q1Opt3Desc: 'Via een uitzendbureau',
    q1Opt4: 'ZZP / freelance',
    q1Opt4Desc: 'Als zelfstandige',
    q1Opt5: 'Weet ik niet zeker',
    q1Opt5Desc: 'Geen zorgen, we helpen je verder',
    q2Question: 'Hoe ben je ontslagen?',
    q2Explanation: 'De manier waarop je ontslag is gegaan bepaalt welke stappen je kunt nemen.',
    q2Opt1: 'Op staande voet',
    q2Opt1Desc: 'Direct ontslagen zonder opzegtermijn',
    q2Opt2: 'Met opzegtermijn',
    q2Opt2Desc: 'Normale opzegprocedure',
    q2Opt3: 'Contract niet verlengd',
    q2Opt3Desc: 'Tijdelijk contract afgelopen',
    q2Opt4: 'Vaststellingsovereenkomst',
    q2Opt4Desc: 'Met wederzijds goedvinden',
    q2Opt5: 'Anders / weet niet',
    q2Opt5Desc: 'We helpen je uitzoeken wat er is gebeurd',
    q3Question: 'Denk je dat je ontslag te maken heeft met een van deze kenmerken?',
    q3Explanation: 'In Nederland is het verboden om iemand te ontslaan vanwege deze kenmerken.',
    q3Opt1: 'Gezondheid of handicap',
    q3Opt1Desc: 'Ziekte, beperking of chronische aandoening',
    q3Opt2: 'Afkomst of huidskleur',
    q3Opt2Desc: 'Ras, nationaliteit of etnische achtergrond',
    q3Opt3: 'Geslacht of gender',
    q3Opt3Desc: 'Man, vrouw of non-binair',
    q3Opt4: 'Leeftijd',
    q3Opt4Desc: 'Te jong of te oud',
    q3Opt5: 'Geloof of overtuiging',
    q3Opt5Desc: 'Religie of levensbeschouwing',
    q3Opt6: 'Seksuele gerichtheid',
    q3Opt6Desc: 'Homo, lesbisch, bi of hetero',
    q3Opt7: 'Zwangerschap of ouderschap',
    q3Opt7Desc: 'Zwanger, recent bevallen of ouderschapsverlof',
    q3Opt8: 'Meerdere van bovenstaande',
    q3Opt8Desc: 'Een combinatie van factoren',
    q3Opt9: 'Geen van deze',
    q3Opt9Desc: 'Of ik weet het niet zeker',
    q4Question: 'Heb je bewijs of aanwijzingen?',
    q4Explanation: 'Bewijs kan helpen, maar is niet altijd nodig. Denk aan e-mails, berichten, getuigen, of een patroon.',
    q4Opt1: 'Schriftelijk bewijs',
    q4Opt1Desc: 'E-mails, WhatsApp, brieven',
    q4Opt2: 'Getuigen',
    q4Opt2Desc: 'Collega\'s of anderen die iets hebben gezien',
    q4Opt3: 'Patroon van gedrag',
    q4Opt3Desc: 'Meerdere incidenten of opmerkingen',
    q4Opt4: 'Geen bewijs',
    q4Opt4Desc: 'Dat is niet erg, we kunnen toch verder',
    q4Opt5: 'Weet ik niet',
    q4Opt5Desc: 'We helpen je bedenken wat je hebt',
    q5Question: 'Wanneer is dit gebeurd?',
    q5Explanation: 'Termijnen zijn belangrijk in Nederland. Sommige stappen moet je binnen een bepaalde tijd zetten.',
    q5Opt1: 'Afgelopen week',
    q5Opt1Desc: 'Minder dan 7 dagen geleden',
    q5Opt2: 'Afgelopen maand',
    q5Opt2Desc: '1 tot 4 weken geleden',
    q5Opt3: 'Afgelopen 3 maanden',
    q5Opt3Desc: '1 tot 3 maanden geleden',
    q5Opt4: 'Langer geleden',
    q5Opt4Desc: 'Meer dan 3 maanden',
    q5Opt5: 'Weet ik niet precies',
    q5Opt5Desc: 'We kunnen dit samen uitzoeken',

    // Tijdlijn page
    tijdlijnTitle: 'Je Tijdlijn',
    tijdlijnSubtitle: 'Documenteer wat er is gebeurd. Dit helpt bij gesprekken met adviseurs.',
    tijdlijnExport: 'Exporteren',
    tijdlijnAdd: 'Toevoegen',
    tijdlijnEmpty: 'Je tijdlijn is nog leeg',
    tijdlijnEmptyDesc: 'Begin met het toevoegen van gebeurtenissen. Denk aan gesprekken, incidenten, of momenten die belangrijk zijn voor je situatie.',
    tijdlijnFirstEvent: 'Eerste gebeurtenis toevoegen',
    tijdlijnLoginTitle: 'Log in om je tijdlijn te gebruiken',
    tijdlijnLoginDesc: 'Om gebeurtenissen op te slaan en later terug te kijken, heb je een account nodig. Je gegevens blijven privé en veilig.',
    tijdlijnLoginButton: 'Inloggen of registreren',
    tijdlijnBackHome: 'Terug naar home',
    tijdlijnNewEvent: 'Nieuwe gebeurtenis',
    tijdlijnEditEvent: 'Gebeurtenis bewerken',
    tijdlijnEventDesc: 'Beschrijf wat er is gebeurd. Neem je tijd en vul in wat je weet.',
    tijdlijnDate: 'Datum',
    tijdlijnType: 'Type',
    tijdlijnShortTitle: 'Korte titel',
    tijdlijnTitlePlaceholder: 'Bijv: Gesprek met manager',
    tijdlijnWhatHappened: 'Wat is er gebeurd?',
    tijdlijnWhatHappenedPlaceholder: 'Beschrijf in je eigen woorden wat er is gebeurd...',
    tijdlijnWhoInvolved: 'Wie waren erbij?',
    tijdlijnWhoInvolvedPlaceholder: 'Bijv: Jan (manager), Lisa (HR)',
    tijdlijnEvidence: 'Bewijs of notities',
    tijdlijnEvidencePlaceholder: 'Heb je e-mails, berichten of andere bewijzen? Noteer hier waar je ze kunt vinden.',
    tijdlijnCancel: 'Annuleren',
    tijdlijnSave: 'Opslaan',
    tijdlijnUpdate: 'Bijwerken',
    tijdlijnInvolved: 'Betrokken:',
    tijdlijnEvidenceLabel: 'Bewijs:',
    tijdlijnDeleteConfirm: 'Weet je zeker dat je deze gebeurtenis wilt verwijderen?',
    tijdlijnEventUpdated: 'Gebeurtenis bijgewerkt',
    tijdlijnEventAdded: 'Gebeurtenis toegevoegd',
    tijdlijnEventDeleted: 'Gebeurtenis verwijderd',
    tijdlijnExported: 'Tijdlijn geëxporteerd',
    tijdlijnLoadError: 'Kon je tijdlijn niet laden. Probeer het later opnieuw.',
    tijdlijnSaveError: 'Kon de gebeurtenis niet opslaan. Probeer het opnieuw.',
    tijdlijnDeleteError: 'Kon de gebeurtenis niet verwijderen.',
    // Event types
    eventTypeIncident: 'Incident',
    eventTypeConversation: 'Gesprek',
    eventTypeDocument: 'Document',
    eventTypeWitness: 'Getuige',
    eventTypeOther: 'Overig',

    // Termijnen page
    termijnenTitle: 'Termijnberekener',
    termijnenSubtitle: 'Bereken belangrijke termijnen en deadlines voor jouw situatie.',
    termijnenInputTitle: 'Vul je ontslagdatum in',
    termijnenInputDesc: 'Dit is de datum waarop je bent ontslagen of je contract is beëindigd.',
    termijnenDismissalDate: 'Ontslagdatum',
    termijnenCalculate: 'Bereken termijnen',
    termijnenYourDeadlines: 'Jouw belangrijke termijnen',
    termijnenExpired: 'Verlopen',
    termijnenDaysLeft: 'dagen',
    termijnenImportant: 'Belangrijk',
    termijnenImportantDesc: 'Deze termijnen zijn indicatief. Je exacte situatie kan andere termijnen hebben. Neem altijd contact op met Het Juridisch Loket (0900-8020) voor advies op maat.',
    termijnenEmptyTitle: 'Weet je je ontslagdatum?',
    termijnenEmptyDesc: 'Vul hierboven je ontslagdatum in en wij berekenen de belangrijkste termijnen en deadlines voor jouw situatie.',
    // Deadline names and descriptions
    deadlineUwv: 'Bezwaar tegen UWV beslissing',
    deadlineUwvDesc: 'Als je een beslissing hebt ontvangen van het UWV waar je het niet mee eens bent.',
    deadlineCourt: 'Verzoek tot vernietiging ontslag',
    deadlineCourtDesc: 'Bij de kantonrechter als je vindt dat het ontslag onterecht was.',
    deadlineWw: 'WW-uitkering aanvragen',
    deadlineWwDesc: 'Vraag je WW-uitkering aan zodra je weet dat je werkloos wordt.',
    deadlineHumanRights: 'Klacht bij College voor de Rechten van de Mens',
    deadlineHumanRightsDesc: 'Bij vermoeden van discriminatie. Geen harde termijn, maar sneller is beter.',
    deadlineClaim: 'Vordering loon of schadevergoeding',
    deadlineClaimDesc: 'Maximale termijn voor financiële claims.',

    // Procesgids page
    procesgidsTitle: 'Procesgids',
    procesgidsSubtitle: 'Begrijp hoe het Nederlandse arbeidsrechtsysteem werkt en welke stappen je kunt zetten.',
    procesgidsProcessTitle: 'Het proces stap voor stap',
    procesgidsResourcesTitle: 'Hulpbronnen',
    procesgidsFaqTitle: 'Veelgestelde vragen',
    procesgidsCtaTitle: 'Klaar om te beginnen?',
    procesgidsCtaDesc: 'Gebruik onze tools om je situatie in kaart te brengen en je voor te bereiden.',
    // Process steps
    processStep1Title: 'Verzamel informatie',
    processStep1Desc: 'Documenteer wat er is gebeurd, bewaar e-mails en berichten.',
    processStep1Detail1: 'Schrijf zo snel mogelijk op wat er is gebeurd',
    processStep1Detail2: 'Bewaar alle e-mails, WhatsApp-berichten en brieven',
    processStep1Detail3: 'Noteer namen van getuigen',
    processStep1Detail4: 'Gebruik onze Tijdlijnbouwer om alles overzichtelijk te maken',
    processStep2Title: 'Vraag advies',
    processStep2Desc: 'Neem contact op met Het Juridisch Loket voor gratis advies.',
    processStep2Detail1: 'Bel 0900-8020 voor gratis advies',
    processStep2Detail2: 'Je kunt ook langsgaan bij een spreekuur',
    processStep2Detail3: 'Leg je situatie uit en vraag wat je opties zijn',
    processStep2Detail4: 'Vraag naar termijnen die voor jou gelden',
    processStep3Title: 'Kies je route',
    processStep3Desc: 'Afhankelijk van je situatie zijn er verschillende mogelijkheden.',
    processStep3Detail1: 'Bezwaar maken bij UWV (bij ontslagvergunning)',
    processStep3Detail2: 'Naar de kantonrechter (bij ontslag op staande voet)',
    processStep3Detail3: 'College voor de Rechten van de Mens (bij discriminatie)',
    processStep3Detail4: 'Onderhandelen met je werkgever',
    processStep4Title: 'Onderneem actie',
    processStep4Desc: 'Zet de gekozen stappen, binnen de geldende termijnen.',
    processStep4Detail1: 'Vraag zo nodig WW aan',
    processStep4Detail2: 'Dien eventueel een klacht in',
    processStep4Detail3: 'Verzamel extra bewijs indien nodig',
    processStep4Detail4: 'Houd alle correspondentie bij',
    // Resources
    resourceJuridischLoket: 'Het Juridisch Loket',
    resourceJuridischLoketDesc: 'Gratis juridisch advies voor iedereen',
    resourceCollege: 'College voor de Rechten van de Mens',
    resourceCollegeDesc: 'Beoordeelt discriminatieklachten (gratis)',
    resourceUwv: 'UWV',
    resourceUwvDesc: 'Uitkeringen en ontslagprocedures',
    resourceFnv: 'FNV',
    resourceFnvDesc: 'Vakbond met juridische ondersteuning',
    resourceAntidiscriminatie: 'Antidiscriminatiebureau',
    resourceAntidiscriminatieDesc: 'Lokale hulp bij discriminatie',
    // FAQ
    faq1Question: 'Wat is het College voor de Rechten van de Mens?',
    faq1Answer: 'Het College voor de Rechten van de Mens is een onafhankelijke instantie die oordeelt over discriminatieklachten. Het is gratis om een klacht in te dienen. Het College geeft een oordeel over of er sprake was van discriminatie. Dit oordeel is niet juridisch bindend, maar wordt vaak wel gevolgd door rechters en werkgevers.',
    faq2Question: 'Wat doet het UWV?',
    faq2Answer: 'Het UWV (Uitvoeringsinstituut Werknemersverzekeringen) beoordeelt ontslagaanvragen van werkgevers en regelt uitkeringen zoals de WW. Als je werkgever je wil ontslaan om bedrijfseconomische redenen of langdurige ziekte, moet die een vergunning aanvragen bij het UWV. Je kunt bezwaar maken tegen beslissingen van het UWV.',
    faq3Question: 'Wat is een vaststellingsovereenkomst?',
    faq3Answer: 'Een vaststellingsovereenkomst is een overeenkomst tussen jou en je werkgever over het beëindigen van je arbeidscontract. Hierin worden afspraken gemaakt over zaken als een ontslagvergoeding, opzegtermijn en getuigschrift. Let op: teken nooit zomaar! Je hebt 14 dagen bedenktijd nadat je hebt getekend.',
    faq4Question: 'Hoe lang duurt een procedure bij de kantonrechter?',
    faq4Answer: 'Een procedure bij de kantonrechter duurt gemiddeld 4 tot 8 weken. Je moet binnen 2 maanden na je ontslag een verzoekschrift indienen. De rechter plant dan een zitting, en meestal volgt binnen enkele weken een uitspraak. Bij complexe zaken kan het langer duren.',
    faq5Question: 'Wat zijn beschermde gronden?',
    faq5Answer: 'Beschermde gronden zijn kenmerken waarop je niet gediscrimineerd mag worden. In Nederland zijn dit: godsdienst, levensovertuiging, politieke gezindheid, ras, geslacht, nationaliteit, seksuele gerichtheid, burgerlijke staat, handicap of chronische ziekte, en leeftijd.',
    faq6Question: 'Heb ik recht op een WW-uitkering?',
    faq6Answer: 'Je hebt recht op WW als je: minimaal 26 weken hebt gewerkt in de 36 weken voor je werkloosheid, niet zelf ontslag hebt genomen, en beschikbaar bent voor werk. Bij ontslag op staande voet kun je mogelijk geen WW krijgen als het ontslag je eigen schuld was. Het UWV beoordeelt dit per geval.',

    // Hulp page
    hulpTitle: 'Hulp & Ondersteuning',
    hulpSubtitle: 'Kies hoe je hulp wilt krijgen: video of tekst',
    hulpVideoAssistant: 'Video Assistent',
    hulpTextChat: 'Tekst Chat',
    hulpChatSubtitle: 'Hier om te helpen, niet te oordelen',
    hulpWelcome: 'Hoi, ik ben Mira.',
    hulpWelcomeDesc: 'Ik ben hier om je te helpen begrijpen wat er op je werk is gebeurd. Neem je tijd - er is geen haast.',
    hulpSuggestionIntro: 'Weet je niet waar je moet beginnen? Probeer een van deze:',
    hulpThinking: 'Even denken...',
    hulpErrorMessage: 'Er ging iets mis, maar dat geeft niet. Dit kan gebeuren.',
    hulpTryAgain: 'Probeer opnieuw',
    hulpInputPlaceholder: 'Wat houdt je bezig?',
    hulpDisclaimer: 'Ik help je te begrijpen - dit is geen juridisch advies.',
    hulpDisclaimerTitle: '⚠️ Dit is informatie, geen juridisch advies',
    hulpDisclaimerDesc: 'Alles wat we bespreken is bedoeld om je te helpen begrijpen. Het is geen vervanging voor professioneel advies. Laat belangrijke beslissingen altijd controleren door een adviseur.',
    hulpHumanTitle: '📞 Praat met een echte adviseur',
    hulpPrivacyNote: 'Je privacy is belangrijk. Alles wat je deelt blijft vertrouwelijk en wordt alleen gebruikt om je te helpen.',
    hulpSummaryTitle: 'Samenvatting ontvangen?',
    hulpSummaryDesc: 'Wil je een overzichtelijke samenvatting van dit gesprek ontvangen per e-mail?',
    hulpSummaryQuestion: 'Per e-mail, helemaal gratis',
    hulpNoThanks: 'Nee, bedankt',
    hulpSend: 'Verstuur',
    hulpEmailPlaceholder: 'je@email.nl',
    hulpSummarySent: 'Samenvatting verzonden',
    hulpSummarySentDesc: 'We sturen een samenvatting naar je e-mail',
    hulpQ1: 'Ik ben ontslagen en weet niet waarom',
    hulpQ2: 'Wat telt als discriminatie?',
    hulpQ3: 'Hoeveel tijd heb ik?',
    hulpQ4: 'Wat doet Het Juridisch Loket?',

    // Accessibility
    accessibilityTitle: 'Toegankelijkheid',
    narratorMode: 'Voorleesfunctie',
    narratorModeDesc: 'Laat de inhoud van de pagina voorlezen',
    narratorEnabled: 'Aan',
    narratorDisabled: 'Uit',
    narratorPlay: 'Afspelen',
    narratorStop: 'Stop',
    readingFont: 'Leeslettertype',
    readingFontDesc: 'Kies een lettertype dat makkelijker te lezen is',
    fontStandard: 'Standaard',
    fontDyslexia: 'Dyslexie',
    textSize: 'Tekstgrootte',
    textSizeDesc: 'Maak alles groter en makkelijker te zien',
    textSizeStandard: 'Standaard',
    textSizeLarge: 'Groot',
    textSizeLarger: 'Groter',
    preferencesSaved: 'Je voorkeuren worden automatisch opgeslagen.',
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

    // Rechtenverkenner page
    rechtenverkennerQuestion: 'Question',
    rechtenverkennerCompleted: 'completed',
    rechtenverkennerPrevious: 'Previous',
    rechtenverkennerNext: 'Next',
    rechtenverkennerViewResults: 'View results',
    rechtenverkennerResultsTitle: 'Your answers have been reviewed',
    rechtenverkennerResultsSubtitle: 'Based on what you\'ve shared, here are our suggestions.',
    rechtenverkennerPossibleDiscrimination: 'Possible discrimination',
    rechtenverkennerPossibleDiscriminationDesc: 'Based on your answers, it appears your dismissal may be related to a protected characteristic. This could be discrimination under the law.',
    rechtenverkennerDeadlineWarning: 'Watch the deadlines',
    rechtenverkennerDeadlineWarningDesc: 'If your dismissal was a while ago, some deadlines may have passed. Contact the Juridisch Loket soon to discuss your options.',
    rechtenverkennerRecommendedSteps: 'Recommended next steps',
    rechtenverkennerStep1Title: 'Call the Juridisch Loket',
    rechtenverkennerStep1Desc: 'Free legal advice: 0900-8020. They can assess your situation.',
    rechtenverkennerStep2Title: 'Document everything',
    rechtenverkennerStep2Desc: 'Use our Timeline Builder to record all events.',
    rechtenverkennerStep3Title: 'Netherlands Institute for Human Rights',
    rechtenverkennerStep3Desc: 'Free and accessible. They can give a ruling on discrimination.',
    rechtenverkennerStartOver: 'Start over',
    rechtenverkennerToTimeline: 'Go to Timeline Builder',
    // Question content
    q1Question: 'What was your employment situation?',
    q1Explanation: 'This helps us understand which rules apply to your situation.',
    q1Opt1: 'Permanent contract',
    q1Opt1Desc: 'Indefinite term contract',
    q1Opt2: 'Fixed-term contract',
    q1Opt2Desc: 'Contract for a specific period',
    q1Opt3: 'Temp work',
    q1Opt3Desc: 'Through a temp agency',
    q1Opt4: 'Freelance / self-employed',
    q1Opt4Desc: 'As an independent contractor',
    q1Opt5: 'Not sure',
    q1Opt5Desc: 'No worries, we\'ll help you figure it out',
    q2Question: 'How were you dismissed?',
    q2Explanation: 'The way you were dismissed determines what steps you can take.',
    q2Opt1: 'Summary dismissal',
    q2Opt1Desc: 'Immediately dismissed without notice',
    q2Opt2: 'With notice period',
    q2Opt2Desc: 'Standard termination procedure',
    q2Opt3: 'Contract not renewed',
    q2Opt3Desc: 'Fixed-term contract ended',
    q2Opt4: 'Settlement agreement',
    q2Opt4Desc: 'By mutual consent',
    q2Opt5: 'Other / not sure',
    q2Opt5Desc: 'We\'ll help you figure out what happened',
    q3Question: 'Do you think your dismissal is related to any of these characteristics?',
    q3Explanation: 'In the Netherlands, it\'s illegal to dismiss someone because of these characteristics.',
    q3Opt1: 'Health or disability',
    q3Opt1Desc: 'Illness, impairment, or chronic condition',
    q3Opt2: 'Race or skin color',
    q3Opt2Desc: 'Race, nationality, or ethnic background',
    q3Opt3: 'Sex or gender',
    q3Opt3Desc: 'Male, female, or non-binary',
    q3Opt4: 'Age',
    q3Opt4Desc: 'Too young or too old',
    q3Opt5: 'Religion or belief',
    q3Opt5Desc: 'Religion or worldview',
    q3Opt6: 'Sexual orientation',
    q3Opt6Desc: 'Gay, lesbian, bi, or straight',
    q3Opt7: 'Pregnancy or parenthood',
    q3Opt7Desc: 'Pregnant, recently given birth, or parental leave',
    q3Opt8: 'Multiple of the above',
    q3Opt8Desc: 'A combination of factors',
    q3Opt9: 'None of these',
    q3Opt9Desc: 'Or I\'m not sure',
    q4Question: 'Do you have evidence or indications?',
    q4Explanation: 'Evidence can help, but isn\'t always necessary. Think of emails, messages, witnesses, or a pattern.',
    q4Opt1: 'Written evidence',
    q4Opt1Desc: 'Emails, WhatsApp, letters',
    q4Opt2: 'Witnesses',
    q4Opt2Desc: 'Colleagues or others who saw something',
    q4Opt3: 'Pattern of behavior',
    q4Opt3Desc: 'Multiple incidents or remarks',
    q4Opt4: 'No evidence',
    q4Opt4Desc: 'That\'s okay, we can still proceed',
    q4Opt5: 'Not sure',
    q4Opt5Desc: 'We\'ll help you think about what you have',
    q5Question: 'When did this happen?',
    q5Explanation: 'Deadlines are important in the Netherlands. Some steps must be taken within a certain time.',
    q5Opt1: 'Past week',
    q5Opt1Desc: 'Less than 7 days ago',
    q5Opt2: 'Past month',
    q5Opt2Desc: '1 to 4 weeks ago',
    q5Opt3: 'Past 3 months',
    q5Opt3Desc: '1 to 3 months ago',
    q5Opt4: 'Longer ago',
    q5Opt4Desc: 'More than 3 months',
    q5Opt5: 'Not exactly sure',
    q5Opt5Desc: 'We can figure this out together',

    // Tijdlijn page
    tijdlijnTitle: 'Your Timeline',
    tijdlijnSubtitle: 'Document what happened. This helps in conversations with advisors.',
    tijdlijnExport: 'Export',
    tijdlijnAdd: 'Add',
    tijdlijnEmpty: 'Your timeline is empty',
    tijdlijnEmptyDesc: 'Start by adding events. Think of conversations, incidents, or moments that are important to your situation.',
    tijdlijnFirstEvent: 'Add first event',
    tijdlijnLoginTitle: 'Log in to use your timeline',
    tijdlijnLoginDesc: 'To save events and review them later, you need an account. Your data remains private and secure.',
    tijdlijnLoginButton: 'Log in or register',
    tijdlijnBackHome: 'Back to home',
    tijdlijnNewEvent: 'New event',
    tijdlijnEditEvent: 'Edit event',
    tijdlijnEventDesc: 'Describe what happened. Take your time and fill in what you know.',
    tijdlijnDate: 'Date',
    tijdlijnType: 'Type',
    tijdlijnShortTitle: 'Short title',
    tijdlijnTitlePlaceholder: 'E.g.: Meeting with manager',
    tijdlijnWhatHappened: 'What happened?',
    tijdlijnWhatHappenedPlaceholder: 'Describe in your own words what happened...',
    tijdlijnWhoInvolved: 'Who was involved?',
    tijdlijnWhoInvolvedPlaceholder: 'E.g.: John (manager), Lisa (HR)',
    tijdlijnEvidence: 'Evidence or notes',
    tijdlijnEvidencePlaceholder: 'Do you have emails, messages, or other evidence? Note where you can find them.',
    tijdlijnCancel: 'Cancel',
    tijdlijnSave: 'Save',
    tijdlijnUpdate: 'Update',
    tijdlijnInvolved: 'Involved:',
    tijdlijnEvidenceLabel: 'Evidence:',
    tijdlijnDeleteConfirm: 'Are you sure you want to delete this event?',
    tijdlijnEventUpdated: 'Event updated',
    tijdlijnEventAdded: 'Event added',
    tijdlijnEventDeleted: 'Event deleted',
    tijdlijnExported: 'Timeline exported',
    tijdlijnLoadError: 'Could not load your timeline. Please try again later.',
    tijdlijnSaveError: 'Could not save the event. Please try again.',
    tijdlijnDeleteError: 'Could not delete the event.',
    // Event types
    eventTypeIncident: 'Incident',
    eventTypeConversation: 'Conversation',
    eventTypeDocument: 'Document',
    eventTypeWitness: 'Witness',
    eventTypeOther: 'Other',

    // Termijnen page
    termijnenTitle: 'Deadline Calculator',
    termijnenSubtitle: 'Calculate important deadlines for your situation.',
    termijnenInputTitle: 'Enter your dismissal date',
    termijnenInputDesc: 'This is the date you were dismissed or your contract ended.',
    termijnenDismissalDate: 'Dismissal date',
    termijnenCalculate: 'Calculate deadlines',
    termijnenYourDeadlines: 'Your important deadlines',
    termijnenExpired: 'Expired',
    termijnenDaysLeft: 'days',
    termijnenImportant: 'Important',
    termijnenImportantDesc: 'These deadlines are indicative. Your exact situation may have different deadlines. Always contact the Juridisch Loket (0900-8020) for tailored advice.',
    termijnenEmptyTitle: 'Do you know your dismissal date?',
    termijnenEmptyDesc: 'Enter your dismissal date above and we\'ll calculate the most important deadlines for your situation.',
    // Deadline names and descriptions
    deadlineUwv: 'Appeal UWV decision',
    deadlineUwvDesc: 'If you received a decision from UWV that you disagree with.',
    deadlineCourt: 'Request dismissal annulment',
    deadlineCourtDesc: 'At the sub-district court if you believe the dismissal was unjust.',
    deadlineWw: 'Apply for unemployment benefits',
    deadlineWwDesc: 'Apply for unemployment benefits as soon as you know you\'ll be unemployed.',
    deadlineHumanRights: 'Complaint to Netherlands Institute for Human Rights',
    deadlineHumanRightsDesc: 'If you suspect discrimination. No hard deadline, but sooner is better.',
    deadlineClaim: 'Wage or compensation claim',
    deadlineClaimDesc: 'Maximum period for financial claims.',

    // Procesgids page
    procesgidsTitle: 'Process Guide',
    procesgidsSubtitle: 'Understand how the Dutch employment law system works and what steps you can take.',
    procesgidsProcessTitle: 'The process step by step',
    procesgidsResourcesTitle: 'Resources',
    procesgidsFaqTitle: 'Frequently asked questions',
    procesgidsCtaTitle: 'Ready to get started?',
    procesgidsCtaDesc: 'Use our tools to map out your situation and prepare.',
    // Process steps
    processStep1Title: 'Gather information',
    processStep1Desc: 'Document what happened, save emails and messages.',
    processStep1Detail1: 'Write down what happened as soon as possible',
    processStep1Detail2: 'Save all emails, WhatsApp messages, and letters',
    processStep1Detail3: 'Note down names of witnesses',
    processStep1Detail4: 'Use our Timeline Builder to organize everything',
    processStep2Title: 'Get advice',
    processStep2Desc: 'Contact the Juridisch Loket for free advice.',
    processStep2Detail1: 'Call 0900-8020 for free advice',
    processStep2Detail2: 'You can also visit during office hours',
    processStep2Detail3: 'Explain your situation and ask what your options are',
    processStep2Detail4: 'Ask about deadlines that apply to you',
    processStep3Title: 'Choose your path',
    processStep3Desc: 'Depending on your situation, there are different options.',
    processStep3Detail1: 'Object at UWV (for dismissal permits)',
    processStep3Detail2: 'Go to sub-district court (for summary dismissal)',
    processStep3Detail3: 'Netherlands Institute for Human Rights (for discrimination)',
    processStep3Detail4: 'Negotiate with your employer',
    processStep4Title: 'Take action',
    processStep4Desc: 'Take the chosen steps, within the applicable deadlines.',
    processStep4Detail1: 'Apply for unemployment benefits if needed',
    processStep4Detail2: 'File a complaint if applicable',
    processStep4Detail3: 'Gather additional evidence if needed',
    processStep4Detail4: 'Keep all correspondence',
    // Resources
    resourceJuridischLoket: 'Juridisch Loket',
    resourceJuridischLoketDesc: 'Free legal advice for everyone',
    resourceCollege: 'Netherlands Institute for Human Rights',
    resourceCollegeDesc: 'Reviews discrimination complaints (free)',
    resourceUwv: 'UWV',
    resourceUwvDesc: 'Benefits and dismissal procedures',
    resourceFnv: 'FNV',
    resourceFnvDesc: 'Union with legal support',
    resourceAntidiscriminatie: 'Anti-discrimination bureau',
    resourceAntidiscriminatieDesc: 'Local help with discrimination',
    // FAQ
    faq1Question: 'What is the Netherlands Institute for Human Rights?',
    faq1Answer: 'The Netherlands Institute for Human Rights is an independent body that rules on discrimination complaints. It\'s free to file a complaint. The Institute gives a ruling on whether discrimination occurred. This ruling is not legally binding, but is often followed by judges and employers.',
    faq2Question: 'What does UWV do?',
    faq2Answer: 'UWV (Employee Insurance Agency) assesses dismissal requests from employers and manages benefits like unemployment insurance. If your employer wants to dismiss you for economic reasons or long-term illness, they must apply for a permit from UWV. You can object to UWV decisions.',
    faq3Question: 'What is a settlement agreement?',
    faq3Answer: 'A settlement agreement is an agreement between you and your employer about ending your employment contract. It includes arrangements about things like severance pay, notice period, and reference letter. Note: never sign without thinking! You have 14 days to reconsider after signing.',
    faq4Question: 'How long does a procedure at the sub-district court take?',
    faq4Answer: 'A procedure at the sub-district court takes an average of 4 to 8 weeks. You must file a request within 2 months of your dismissal. The judge then schedules a hearing, and usually a decision follows within a few weeks. Complex cases may take longer.',
    faq5Question: 'What are protected grounds?',
    faq5Answer: 'Protected grounds are characteristics on which you may not be discriminated against. In the Netherlands, these are: religion, life philosophy, political opinion, race, sex, nationality, sexual orientation, marital status, disability or chronic illness, and age.',
    faq6Question: 'Am I entitled to unemployment benefits?',
    faq6Answer: 'You\'re entitled to unemployment benefits if you: worked at least 26 weeks in the 36 weeks before your unemployment, didn\'t resign yourself, and are available for work. With summary dismissal, you may not get benefits if the dismissal was your own fault. UWV assesses this case by case.',

    // Hulp page
    hulpTitle: 'Help & Support',
    hulpSubtitle: 'Choose how you want to get help: video or text',
    hulpVideoAssistant: 'Video Assistant',
    hulpTextChat: 'Text Chat',
    hulpChatSubtitle: 'Here to help, not to judge',
    hulpWelcome: 'Hi, I\'m Mira.',
    hulpWelcomeDesc: 'I\'m here to help you understand what happened at work. Take your time - there\'s no rush.',
    hulpSuggestionIntro: 'Not sure where to start? Try one of these:',
    hulpThinking: 'Thinking...',
    hulpErrorMessage: 'Something went wrong, but that\'s okay. This can happen.',
    hulpTryAgain: 'Try again',
    hulpInputPlaceholder: 'What\'s on your mind?',
    hulpDisclaimer: 'I help you understand - this is not legal advice.',
    hulpDisclaimerTitle: '⚠️ This is information, not legal advice',
    hulpDisclaimerDesc: 'Everything we discuss is meant to help you understand. It\'s not a substitute for professional advice. Always have important decisions reviewed by an advisor.',
    hulpHumanTitle: '📞 Talk to a real advisor',
    hulpPrivacyNote: 'Your privacy matters. Everything you share stays confidential and is only used to help you.',
    hulpSummaryTitle: 'Receive a summary?',
    hulpSummaryDesc: 'Would you like to receive a clear summary of this conversation by email?',
    hulpSummaryQuestion: 'By email, completely free',
    hulpNoThanks: 'No, thanks',
    hulpSend: 'Send',
    hulpEmailPlaceholder: 'you@email.com',
    hulpSummarySent: 'Summary sent',
    hulpSummarySentDesc: 'We\'ll send a summary to your email',
    hulpQ1: 'I was dismissed and don\'t know why',
    hulpQ2: 'What counts as discrimination?',
    hulpQ3: 'How much time do I have?',
    hulpQ4: 'What does the Juridisch Loket do?',

    // Accessibility
    accessibilityTitle: 'Accessibility',
    narratorMode: 'Narrator Mode',
    narratorModeDesc: 'Let the page content be read aloud to you',
    narratorEnabled: 'Enabled',
    narratorDisabled: 'Disabled',
    narratorPlay: 'Play',
    narratorStop: 'Stop',
    readingFont: 'Reading Font',
    readingFontDesc: 'Choose a font that is easier for you to read',
    fontStandard: 'Standard',
    fontDyslexia: 'Dyslexia',
    textSize: 'Text Size',
    textSizeDesc: 'Make everything larger and easier to see',
    textSizeStandard: 'Standard',
    textSizeLarge: 'Large',
    textSizeLarger: 'Larger',
    preferencesSaved: 'Your preferences are saved automatically.',
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
