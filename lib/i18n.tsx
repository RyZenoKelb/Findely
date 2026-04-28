"use client";

import * as React from "react";

export type Locale = "en" | "fr";

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
];

export interface Dict {
  nav: {
    features: string;
    useCases: string;
    howItWorks: string;
    pricing: string;
    signIn: string;
    cta: string;
    backToSite: string;
  };
  hero: {
    badge: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    close: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
  };
  problem: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; body: string }[];
  };
  solution: {
    eyebrow: string;
    title: string;
    subtitle: string;
    bullets: string[];
    tryIt: string;
  };
  useCases: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cases: { title: string; desc: string }[];
  };
  features: {
    eyebrow: string;
    title: string;
    items: { title: string; body: string }[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: { title: string; body: string }[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    month: string;
    mostPopular: string;
    faqTitle: string;
    faq: { q: string; a: string }[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
  app: {
    welcome: string;
    welcomeTitle: string;
    welcomeSub: string;
    newSearch: string;
    leadsFound: string;
    searchesRun: string;
    savedLeads: string;
    exports: string;
    quickSearch: string;
    quickSearchTitle: string;
    savedLists: string;
    savedListsTitle: string;
    viewAll: string;
    recentSearches: string;
    templates: string;
    templatesSub: string;
    goToSearch: string;
  };
  sidebar: {
    overview: string;
    newSearch: string;
    leadLists: string;
    savedSearches: string;
    usage: string;
    settings: string;
    starterPlan: string;
    upgradeCopy: string;
    viewUsage: string;
    workspace: string;
  };
  topbar: {
    demo: string;
    quickSearch: string;
    backToSite: string;
  };
  searchForm: {
    businessType: string;
    location: string;
    country: string;
    language: string;
    objective: string;
    resultLimit: string;
    sources: string;
    filters: string;
    advanced: string;
    hide: string;
    show: string;
    minScore: string;
    requirePhone: string;
    requireWebsite: string;
    onlyContactable: string;
    tip: string;
    searching: string;
    searchLeads: string;
  };
  table: {
    business: string;
    phone: string;
    website: string;
    address: string;
    signals: string;
    score: string;
    missing: string;
    noWebsite: string;
    searchResults: string;
    filters: string;
    withoutWebsite: string;
    withWebsite: string;
    withPhone: string;
    hasAddress: string;
    missingContact: string;
    highScore: string;
    outreachReady: string;
    needsOnlinePresence: string;
    sortScore: string;
    sortName: string;
    sortSource: string;
    exportCsv: string;
    markContacted: string;
    clear: string;
    selectedOfTotal: string;
    showing: string;
    clickRow: string;
    leadsFound: string;
    noMatch: string;
  };
  drawer: {
    about: string;
    signals: string;
    outreachAngle: string;
    notes: string;
    saveNotes: string;
    status: string;
    new: string;
    saved: string;
    contacted: string;
    interested: string;
    ignored: string;
    saveToList: string;
    newList: string;
    noLists: string;
    send: string;
    copy: string;
  };
  settings: {
    profile: string;
    profileSub: string;
    name: string;
    email: string;
    searchDefaults: string;
    searchDefaultsSub: string;
    defaultCountry: string;
    defaultLanguage: string;
    defaultLimit: string;
    preferredSources: string;
    exportPrefs: string;
    exportPrefsSub: string;
    includeScore: string;
    includeSignals: string;
    appearance: string;
    appearanceSub: string;
    language: string;
    languageSub: string;
    theme: string;
    themeDark: string;
    themeSystem: string;
    save: string;
    saved: string;
  };
  usage: {
    currentPlan: string;
    demo: string;
    comparePlans: string;
    upgrade: string;
    thisCycle: string;
    searches: string;
    leads: string;
    exportsLabel: string;
    current: string;
  };
  common: {
    open: string;
    copy: string;
    openMaps: string;
    fallbackUsed: string;
  };
}

const en: Dict = {
  nav: {
    features: "Features",
    useCases: "Use cases",
    howItWorks: "How it works",
    pricing: "Pricing",
    signIn: "Sign in",
    cta: "Start finding leads",
    backToSite: "Back to site",
  },
  hero: {
    badge: "New · Google Places is live",
    titleA: "Find the leads",
    titleB: "worth closing.",
    subtitle:
      "One search across Google Places, directories, and public listings. Every lead scored, signaled, and CSV-ready in seconds.",
    close: "We find. You close.",
    ctaPrimary: "Start finding leads",
    ctaSecondary: "Open the demo",
    note: "No account required · Works offline with realistic sample data",
  },
  problem: {
    eyebrow: "The problem",
    title: "Manual lead generation is slow, messy, and repetitive.",
    subtitle:
      "Every hour spent scraping lists is an hour not closing. Findely replaces the grunt work.",
    items: [
      { title: "Manual prospecting is slow", body: "Copy-pasting from Maps, directories, and LinkedIn eats hours every week." },
      { title: "Lead data is messy", body: "Duplicates, wrong phones, missing websites — your CRM pays the price." },
      { title: "Scoring is guesswork", body: "Without clear signals, teams chase the wrong leads and skip the good ones." },
    ],
  },
  solution: {
    eyebrow: "The solution",
    title: "Your lead research, fully automated.",
    subtitle:
      "Findely searches sources, extracts useful business data, scores leads, and prepares lists for outreach.",
    bullets: [
      "Pulls businesses from multiple sources in one search",
      "Cleans, deduplicates, and normalizes every record",
      "Detects signals like 'no website' or 'outreach ready'",
      "Scores every lead 0-100 based on your objective",
      "Exports a CRM-ready CSV in one click",
    ],
    tryIt: "Try it now",
  },
  useCases: {
    eyebrow: "Use cases",
    title: "Built for teams that sell their time.",
    subtitle:
      "Whether you run a web agency or a B2B sales team, Findely speeds up the boring part of prospecting.",
    cases: [
      { title: "Web agencies", desc: "Find businesses without websites in your area." },
      { title: "Marketing agencies", desc: "Spot companies that could benefit from ads and funnels." },
      { title: "SEO consultants", desc: "Identify websites that could rank higher with your help." },
      { title: "Sales teams", desc: "Build targeted B2B prospect lists on demand." },
      { title: "Freelancers", desc: "Quickly scout clients that match your sweet spot." },
      { title: "Consultants", desc: "Create outreach shortlists for niche verticals." },
      { title: "Recruiters", desc: "Find local businesses in verticals you place candidates into." },
      { title: "Local businesses", desc: "Map your catchment area and benchmark competitors." },
    ],
  },
  features: {
    eyebrow: "Features",
    title: "Everything you need to go from niche to outreach.",
    items: [
      { title: "Multi-source discovery", body: "One search pulls from Google Places, maps, directories, and public listings. Extend with your own providers." },
      { title: "Smart filters", body: "Filter by missing website, phone, address, or score — save the combinations you use most." },
      { title: "Lead scoring", body: "Every lead is ranked 0–100 based on your objective: agency, SEO, outbound, or local." },
      { title: "Lead signals", body: "Visual badges surface why a lead matters: 'No website', 'Outreach ready', 'High opportunity'." },
      { title: "Saved lists", body: "Drop leads into lists like 'Web agency prospects' or 'Contacted'. Rename and reorganize anytime." },
      { title: "CSV export", body: "Export a full list or a selection. Drop it straight into HubSpot, Instantly, or a spreadsheet." },
      { title: "Saved searches", body: "Every search you run is saved. Re-run any query in one click." },
      { title: "Provider architecture", body: "Built-in mock + Google Places. Add Yellow Pages, LinkedIn, or your own in minutes." },
      { title: "Future enrichment", body: "Hook into email finders, domain-tech lookups, and LinkedIn enrichment (roadmap)." },
    ],
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Four steps, ten seconds to your first list.",
    steps: [
      { title: "Enter niche and location", body: "Restaurants in Tel Aviv. Dentists in Paris. Agencies in New York. Any niche, any city." },
      { title: "Choose sources and filters", body: "Pick your sources, set your objective, and refine with advanced filters." },
      { title: "Review scored leads", body: "Findely cleans, dedupes, and scores every lead, then ranks them by opportunity." },
      { title: "Save, export, and contact", body: "Drop leads into lists, export a CSV, and kick off outreach in your tool of choice." },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple pricing, built to scale with you.",
    subtitle: "No seat games, no per-export fees. Upgrade when you're ready.",
    month: "/mo",
    mostPopular: "Most popular",
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Is there a free trial?", a: "The Starter plan is free forever, no credit card required. Upgrade only when you need more volume or sources." },
      { q: "Do I need a Google API key?", a: "Only if you want real Google Places results. The built-in mock provider works offline with realistic sample data." },
      { q: "Can I cancel anytime?", a: "Yes. No lock-in. Your exported CSVs are yours forever." },
      { q: "Do exports include my notes and statuses?", a: "Yes — the CSV export includes score, signals, and status by default. You can toggle these in Settings." },
    ],
  },
  finalCta: {
    title: "Start finding leads today.",
    subtitle: "Spin up your first lead list in under a minute. No credit card, no setup, no scraping headaches.",
    primary: "Start finding leads",
    secondary: "Open the demo",
  },
  app: {
    welcome: "Welcome back",
    welcomeTitle: "Let’s find your next batch of leads.",
    welcomeSub: "Start a new search, revisit past searches, or jump into one of your saved lists.",
    newSearch: "New search",
    leadsFound: "Leads found",
    searchesRun: "Searches run",
    savedLeads: "Saved leads",
    exports: "Exports",
    quickSearch: "Quick search",
    quickSearchTitle: "Prefill and jump to the search page",
    savedLists: "Saved lists",
    savedListsTitle: "Your follow-up piles",
    viewAll: "View all →",
    recentSearches: "Recent searches",
    templates: "Search templates",
    templatesSub: "Pre-built searches for common use cases.",
    goToSearch: "Go to search",
  },
  sidebar: {
    overview: "Overview",
    newSearch: "New search",
    leadLists: "Lead lists",
    savedSearches: "Saved searches",
    usage: "Usage",
    settings: "Settings",
    starterPlan: "Starter plan",
    upgradeCopy: "Upgrade to Pro for all sources and unlimited scoring.",
    viewUsage: "View usage",
    workspace: "Workspace",
  },
  topbar: {
    demo: "Demo mode",
    quickSearch: "Quick search",
    backToSite: "Back to site",
  },
  searchForm: {
    businessType: "Business type / niche",
    location: "Location",
    country: "Country (optional)",
    language: "Language (optional)",
    objective: "Objective",
    resultLimit: "Result limit",
    sources: "Sources",
    filters: "Filters",
    advanced: "Advanced filters",
    hide: "Hide",
    show: "Show",
    minScore: "Minimum score",
    requirePhone: "Require phone",
    requireWebsite: "Require website",
    onlyContactable: "Only contactable",
    tip: "Tip: Use “Find businesses without websites” for web-agency prospecting.",
    searching: "Searching…",
    searchLeads: "Search leads",
  },
  table: {
    business: "Business",
    phone: "Phone",
    website: "Website",
    address: "Address",
    signals: "Signals",
    score: "Score",
    missing: "Missing",
    noWebsite: "No website",
    searchResults: "Search within results…",
    filters: "Filters",
    withoutWebsite: "Without website",
    withWebsite: "With website",
    withPhone: "With phone",
    hasAddress: "Has address",
    missingContact: "Missing contact",
    highScore: "High score",
    outreachReady: "Outreach ready",
    needsOnlinePresence: "Needs online presence",
    sortScore: "Highest score",
    sortName: "Name A–Z",
    sortSource: "Source",
    exportCsv: "Export CSV",
    markContacted: "Mark contacted",
    clear: "Clear",
    selectedOfTotal: "selected of",
    showing: "Showing",
    clickRow: "Click a row to view lead details",
    leadsFound: "leads",
    noMatch: "No leads match these filters.",
  },
  drawer: {
    about: "About",
    signals: "Signals",
    outreachAngle: "Suggested outreach angle",
    notes: "Notes",
    saveNotes: "Save notes",
    status: "Status",
    new: "New",
    saved: "Saved",
    contacted: "Contacted",
    interested: "Interested",
    ignored: "Ignored",
    saveToList: "Save to list",
    newList: "+ New list",
    noLists: "No lists yet. Create one to start saving leads.",
    send: "Send to outreach",
    copy: "Copy name",
  },
  settings: {
    profile: "Profile",
    profileSub: "Placeholder — auth not wired up in V1.",
    name: "Display name",
    email: "Email",
    searchDefaults: "Search defaults",
    searchDefaultsSub: "Used to prefill new searches.",
    defaultCountry: "Default country",
    defaultLanguage: "Default language",
    defaultLimit: "Default result limit",
    preferredSources: "Preferred sources",
    exportPrefs: "Export preferences",
    exportPrefsSub: "Control what ends up in the CSV.",
    includeScore: "Include lead score",
    includeSignals: "Include signals",
    appearance: "Appearance",
    appearanceSub: "Findely ships dark. Light theme coming soon.",
    language: "Interface language",
    languageSub: "Switch the UI between English and French.",
    theme: "Theme",
    themeDark: "Dark (default)",
    themeSystem: "Follow system",
    save: "Save settings",
    saved: "Saved",
  },
  usage: {
    currentPlan: "Current plan",
    demo: "Demo",
    comparePlans: "Compare plans",
    upgrade: "Upgrade to Pro",
    thisCycle: "This billing cycle",
    searches: "Searches",
    leads: "Leads",
    exportsLabel: "Exports",
    current: "Current",
  },
  common: {
    open: "Open website",
    copy: "Copy phone",
    openMaps: "Open in Maps",
    fallbackUsed:
      "Google Places was requested but is not reachable — results came from the sample source.",
  },
};

const fr: Dict = {
  nav: {
    features: "Fonctionnalités",
    useCases: "Cas d’usage",
    howItWorks: "Comment ça marche",
    pricing: "Tarifs",
    signIn: "Connexion",
    cta: "Trouver des leads",
    backToSite: "Retour au site",
  },
  hero: {
    badge: "Nouveau · Google Places disponible",
    titleA: "Trouvez les leads",
    titleB: "qui closent.",
    subtitle:
      "Une recherche sur Google Places, annuaires et listes publiques. Chaque lead scoré, qualifié, exporté en CSV en quelques secondes.",
    close: "On trouve. Vous closez.",
    ctaPrimary: "Trouver des leads",
    ctaSecondary: "Ouvrir la démo",
    note: "Aucun compte requis · Fonctionne hors-ligne avec des données réalistes",
  },
  problem: {
    eyebrow: "Le problème",
    title: "La prospection manuelle est lente, brouillonne et répétitive.",
    subtitle:
      "Chaque heure passée à scraper est une heure perdue pour closer. Findely remplace le travail ingrat.",
    items: [
      { title: "Prospecter à la main prend des heures", body: "Copier-coller depuis Maps, annuaires et LinkedIn consomme vos semaines." },
      { title: "Les données sont sales", body: "Doublons, numéros erronés, sites manquants — votre CRM en pâtit." },
      { title: "Le scoring se fait au feeling", body: "Sans signaux clairs, on chasse les mauvais leads et on rate les bons." },
    ],
  },
  solution: {
    eyebrow: "La solution",
    title: "Votre recherche de leads, totalement automatisée.",
    subtitle:
      "Findely cherche, extrait les données, score les leads et prépare les listes pour la prospection.",
    bullets: [
      "Consolide plusieurs sources en une seule recherche",
      "Nettoie, déduplique et normalise chaque fiche",
      "Détecte des signaux : « sans site web », « prêt pour outreach »…",
      "Score chaque lead de 0 à 100 selon votre objectif",
      "Exporte un CSV prêt pour le CRM en un clic",
    ],
    tryIt: "Essayer maintenant",
  },
  useCases: {
    eyebrow: "Cas d’usage",
    title: "Pensé pour les équipes qui vendent leur temps.",
    subtitle:
      "Que vous soyez une agence web ou une équipe commerciale B2B, Findely accélère la partie ennuyeuse.",
    cases: [
      { title: "Agences web", desc: "Trouvez les entreprises sans site dans votre zone." },
      { title: "Agences marketing", desc: "Repérez celles qui bénéficieraient d’ads et de funnels." },
      { title: "Consultants SEO", desc: "Identifiez les sites qui pourraient mieux se positionner." },
      { title: "Équipes commerciales", desc: "Construisez des listes B2B ciblées à la demande." },
      { title: "Freelances", desc: "Repérez rapidement les clients qui vous correspondent." },
      { title: "Consultants", desc: "Créez des shortlists pour des verticales de niche." },
      { title: "Recruteurs", desc: "Trouvez des entreprises locales dans vos secteurs placés." },
      { title: "Commerces locaux", desc: "Cartographiez votre zone et benchmarkez la concurrence." },
    ],
  },
  features: {
    eyebrow: "Fonctionnalités",
    title: "Tout ce qu’il faut pour passer de la niche à l’outreach.",
    items: [
      { title: "Multi-sources", body: "Une recherche agrège Google Places, annuaires et autres listes publiques." },
      { title: "Filtres intelligents", body: "Filtrez par site manquant, téléphone, adresse ou score." },
      { title: "Scoring de leads", body: "Chaque lead est noté 0–100 selon votre objectif : agence, SEO, outbound, local." },
      { title: "Signaux", body: "Badges visuels : « sans site », « prêt pour outreach », « forte opportunité »." },
      { title: "Listes enregistrées", body: "Rangez vos leads dans des listes nommées, renommez, réorganisez." },
      { title: "Export CSV", body: "Exportez la liste ou la sélection. Ouvrez dans HubSpot, Instantly, ou un tableur." },
      { title: "Recherches enregistrées", body: "Chaque recherche est sauvegardée. Rejouez-la en un clic." },
      { title: "Architecture de providers", body: "Mock + Google Places intégrés. Ajoutez vos propres sources en minutes." },
      { title: "Enrichissement (à venir)", body: "Email finder, tech stack du domaine, enrichissement LinkedIn." },
    ],
  },
  howItWorks: {
    eyebrow: "Comment ça marche",
    title: "Quatre étapes, dix secondes pour votre première liste.",
    steps: [
      { title: "Niche et localisation", body: "Restaurants à Tel Aviv. Dentistes à Paris. Agences à New York." },
      { title: "Sources et filtres", body: "Choisissez vos sources, définissez l’objectif, affinez avec les filtres avancés." },
      { title: "Leads scorés", body: "Findely nettoie, déduplique et score chaque lead, puis les classe par opportunité." },
      { title: "Sauvegarder, exporter, contacter", body: "Rangez dans des listes, exportez un CSV, lancez l’outreach." },
    ],
  },
  pricing: {
    eyebrow: "Tarifs",
    title: "Des tarifs simples, pensés pour scaler avec vous.",
    subtitle: "Pas de jeu sur les sièges ni de frais par export. Montez en gamme quand vous êtes prêt.",
    month: "/mois",
    mostPopular: "Le plus populaire",
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Y a-t-il un essai gratuit ?", a: "Le plan Starter est gratuit à vie, sans carte. Passez à un plan payant uniquement si vous en avez besoin." },
      { q: "Faut-il une clé Google API ?", a: "Uniquement pour les résultats réels Google Places. Le provider mock fonctionne hors-ligne." },
      { q: "Puis-je annuler à tout moment ?", a: "Oui. Aucun engagement. Vos CSV exportés restent à vous." },
      { q: "Les exports incluent-ils mes notes et statuts ?", a: "Oui — l’export CSV inclut score, signaux et statut par défaut. Modifiable dans Paramètres." },
    ],
  },
  finalCta: {
    title: "Commencez à trouver des leads dès aujourd’hui.",
    subtitle: "Lancez votre première liste en moins d’une minute. Pas de carte, pas de setup, pas de scraping.",
    primary: "Trouver des leads",
    secondary: "Ouvrir la démo",
  },
  app: {
    welcome: "Bon retour",
    welcomeTitle: "Trouvons votre prochain lot de leads.",
    welcomeSub: "Lancez une recherche, rejouez une ancienne, ou sautez dans une liste enregistrée.",
    newSearch: "Nouvelle recherche",
    leadsFound: "Leads trouvés",
    searchesRun: "Recherches lancées",
    savedLeads: "Leads enregistrés",
    exports: "Exports",
    quickSearch: "Recherche rapide",
    quickSearchTitle: "Préremplir et ouvrir la page de recherche",
    savedLists: "Listes enregistrées",
    savedListsTitle: "Vos piles de suivi",
    viewAll: "Tout voir →",
    recentSearches: "Recherches récentes",
    templates: "Modèles de recherche",
    templatesSub: "Recherches prêtes à l’emploi pour les cas courants.",
    goToSearch: "Aller à la recherche",
  },
  sidebar: {
    overview: "Vue d’ensemble",
    newSearch: "Nouvelle recherche",
    leadLists: "Listes de leads",
    savedSearches: "Recherches enregistrées",
    usage: "Utilisation",
    settings: "Paramètres",
    starterPlan: "Plan Starter",
    upgradeCopy: "Passez à Pro pour toutes les sources et un scoring illimité.",
    viewUsage: "Voir l’usage",
    workspace: "Espace de travail",
  },
  topbar: {
    demo: "Mode démo",
    quickSearch: "Recherche rapide",
    backToSite: "Retour au site",
  },
  searchForm: {
    businessType: "Type d’entreprise / niche",
    location: "Localisation",
    country: "Pays (optionnel)",
    language: "Langue (optionnel)",
    objective: "Objectif",
    resultLimit: "Limite de résultats",
    sources: "Sources",
    filters: "Filtres",
    advanced: "Filtres avancés",
    hide: "Masquer",
    show: "Afficher",
    minScore: "Score minimum",
    requirePhone: "Téléphone requis",
    requireWebsite: "Site requis",
    onlyContactable: "Contactables uniquement",
    tip: "Astuce : « Entreprises sans site » pour la prospection d’agence web.",
    searching: "Recherche…",
    searchLeads: "Rechercher les leads",
  },
  table: {
    business: "Entreprise",
    phone: "Téléphone",
    website: "Site web",
    address: "Adresse",
    signals: "Signaux",
    score: "Score",
    missing: "Manquant",
    noWebsite: "Sans site",
    searchResults: "Chercher dans les résultats…",
    filters: "Filtres",
    withoutWebsite: "Sans site",
    withWebsite: "Avec site",
    withPhone: "Avec téléphone",
    hasAddress: "Avec adresse",
    missingContact: "Contact manquant",
    highScore: "Score élevé",
    outreachReady: "Prêt outreach",
    needsOnlinePresence: "Présence web à faire",
    sortScore: "Meilleur score",
    sortName: "Nom A–Z",
    sortSource: "Source",
    exportCsv: "Exporter CSV",
    markContacted: "Marquer contacté",
    clear: "Effacer",
    selectedOfTotal: "sélectionnés sur",
    showing: "Affichage",
    clickRow: "Cliquez une ligne pour voir les détails",
    leadsFound: "leads",
    noMatch: "Aucun lead ne correspond.",
  },
  drawer: {
    about: "À propos",
    signals: "Signaux",
    outreachAngle: "Angle d’approche suggéré",
    notes: "Notes",
    saveNotes: "Enregistrer les notes",
    status: "Statut",
    new: "Nouveau",
    saved: "Enregistré",
    contacted: "Contacté",
    interested: "Intéressé",
    ignored: "Ignoré",
    saveToList: "Enregistrer dans une liste",
    newList: "+ Nouvelle liste",
    noLists: "Aucune liste. Créez-en une pour enregistrer des leads.",
    send: "Envoyer en outreach",
    copy: "Copier le nom",
  },
  settings: {
    profile: "Profil",
    profileSub: "Placeholder — auth non branché en V1.",
    name: "Nom affiché",
    email: "Email",
    searchDefaults: "Réglages de recherche",
    searchDefaultsSub: "Utilisés pour préremplir les nouvelles recherches.",
    defaultCountry: "Pays par défaut",
    defaultLanguage: "Langue par défaut",
    defaultLimit: "Limite par défaut",
    preferredSources: "Sources préférées",
    exportPrefs: "Préférences d’export",
    exportPrefsSub: "Contrôlez ce qui apparaît dans le CSV.",
    includeScore: "Inclure le score",
    includeSignals: "Inclure les signaux",
    appearance: "Apparence",
    appearanceSub: "Findely est en mode sombre. Thème clair bientôt.",
    language: "Langue de l’interface",
    languageSub: "Basculez entre anglais et français.",
    theme: "Thème",
    themeDark: "Sombre (défaut)",
    themeSystem: "Suivre le système",
    save: "Enregistrer",
    saved: "Enregistré",
  },
  usage: {
    currentPlan: "Plan actuel",
    demo: "Démo",
    comparePlans: "Comparer les plans",
    upgrade: "Passer à Pro",
    thisCycle: "Ce cycle de facturation",
    searches: "Recherches",
    leads: "Leads",
    exportsLabel: "Exports",
    current: "Actuel",
  },
  common: {
    open: "Ouvrir le site",
    copy: "Copier le téléphone",
    openMaps: "Ouvrir dans Maps",
    fallbackUsed:
      "Google Places a été demandé mais n’est pas disponible — résultats issus de la source d’exemple.",
  },
};

const DICTS: Record<Locale, Dict> = { en, fr };
const LS_KEY = "findely:locale";

interface I18nContextValue {
  locale: Locale;
  t: Dict;
  setLocale: (locale: Locale) => void;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LS_KEY) as Locale | null;
    if (stored === "en" || stored === "fr") setLocaleState(stored);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_KEY, next);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);

  const value = React.useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: DICTS[locale] }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    return { locale: "en", t: DICTS.en, setLocale: () => {} };
  }
  return ctx;
}
