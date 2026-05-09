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
    developers?: string;
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
    statSources?: string;
    statScoring?: string;
    statCleaning?: string;
    statExport?: string;
    badgeNoWebsite?: string;
    badgeHighOpportunity?: string;
    badgeOutreachReady?: string;
    badgeLocalBusiness?: string;
    badgeMissingContact?: string;
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
    sortLabel?: string;
    exportCsv: string;
    markContacted: string;
    clear: string;
    selectedOfTotal: string;
    showing: string;
    clickRow: string;
    leadsFound: string;
    noMatch: string;
    viewDetails?: string;
    copyPhone?: string;
    copyWebsite?: string;
    openWebsite?: string;
    openMaps?: string;
    addToList?: string;
    noListsMenu?: string;
    copiedToast?: string;
    markedContacted?: string;
    savedToList?: string;
    advancedFilters?: string;
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
    eyebrow?: string;
    subtitle?: string;
    unsaved?: string;
    discard?: string;
    navProfile?: string;
    navSearch?: string;
    navExport?: string;
    navAppearance?: string;
    navHistory?: string;
    navDeveloper?: string;
    navAccount?: string;
    navDanger?: string;
    profileDesc?: string;
    searchDefaultsDesc?: string;
    exportPrefsDesc?: string;
    appearanceDesc?: string;
    historyTitle?: string;
    historyDesc?: string;
    historyClearCta?: string;
    historyToast?: string;
    developerTitle?: string;
    developerDesc?: string;
    developerOpenApi?: string;
    developerOpenDocs?: string;
    accountTitle?: string;
    accountDesc?: string;
    accountSignOut?: string;
    dangerTitle?: string;
    dangerDesc?: string;
    dangerAck?: string;
    seenOne?: string;
    seenMany?: string;
    planNameLabel?: string;
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
    apiCredits?: string;
    apiAccessTitle?: string;
    apiAccessBodyOn?: string;
    apiAccessBodyOff?: string;
    apiIncluded?: string;
    apiNotIncluded?: string;
    manageApiKeys?: string;
    compareApiPlans?: string;
    viewApiDocs?: string;
    resetDate?: string;
  };
  common: {
    open: string;
    copy: string;
    openMaps: string;
    fallbackUsed: string;
  };
  auth?: {
    signInTitle: string;
    signInSubtitle: string;
    signUpTitle: string;
    signUpSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    fullNameLabel: string;
    signInCta: string;
    signUpCta: string;
    signOut: string;
    haveAccount: string;
    noAccount: string;
    switchToSignIn: string;
    switchToSignUp: string;
    orDivider: string;
    openDemo: string;
    checkInbox: string;
    checkInboxBody: string;
    genericError: string;
    passwordMinHint: string;
    setupMissing: string;
  };
  quota?: {
    exceededSearches: string;
    exceededLeads: string;
    exceededExports: string;
    exceededApi: string;
    upgradeCta: string;
  };
  demoMode?: {
    demoBadge: string;
    realBadge: string;
    banner: string;
  };
  onboarding?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    skip: string;
    template1Title: string;
    template1Location: string;
    template1Niche: string;
    template2Title: string;
    template2Location: string;
    template2Niche: string;
    template3Title: string;
    template3Location: string;
    template3Niche: string;
  };
  plans?: {
    free: string;
    starter: string;
    pro: string;
    agency: string;
    apiStarter: string;
    apiPro: string;
    apiScale: string;
  };
  apiKeys?: {
    title: string;
    subtitle: string;
    createTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    createCta: string;
    creating: string;
    noKeys: string;
    oneTimeWarning: string;
    copy: string;
    copied: string;
    done: string;
    colName: string;
    colPrefix: string;
    colCreated: string;
    colLastUsed: string;
    colStatus: string;
    active: string;
    revoked: string;
    revoke: string;
    revokeConfirm: string;
    upgradeRequired: string;
    never: string;
    sidebarLink: string;
    intro?: string;
    howItWorksTitle?: string;
    howItWorksBullets?: string[];
    planGatingTitle?: string;
    planGatingBody?: string;
    upgradeCtaCompare?: string;
    upgradeCtaPricing?: string;
    viewDocsCta?: string;
    currentUsageTitle?: string;
    currentUsageBody?: string;
    existingKeysTitle?: string;
    warningTitle?: string;
  };
  developers?: {
    title: string;
    subtitle: string;
    gettingStarted: string;
    authTitle: string;
    authBody: string;
    searchTitle: string;
    usageTitle: string;
    creditsTitle: string;
    creditsBody: string;
    rateLimitsTitle: string;
    rateLimitsBody: string;
    errorsTitle: string;
    createKeyCta: string;
    overviewTitle?: string;
    overviewBody?: string;
    pricingCta?: string;
    manageKeysCta?: string;
  };
  apiPricing?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    creditModelTitle: string;
    creditModelBullets: string[];
    starterTitle: string;
    starterBlurb: string;
    proTitle: string;
    proBlurb: string;
    scaleTitle: string;
    scaleBlurb: string;
    scalePrice: string;
    monthlyCredits: string;
    viewDocs: string;
    manageKeys: string;
    contactScale: string;
    popular: string;
    faqTitle?: string;
    faq?: { q: string; a: string }[];
  };
  migration?: {
    title: string;
    body: string;
    importCta: string;
    dismissCta: string;
    importing: string;
    imported: string;
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
    developers: "Developers",
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
    statSources: "Sources",
    statScoring: "Scoring",
    statCleaning: "Cleaning",
    statExport: "Export",
    badgeNoWebsite: "No website",
    badgeHighOpportunity: "High opportunity",
    badgeOutreachReady: "Outreach ready",
    badgeLocalBusiness: "Local business",
    badgeMissingContact: "Missing contact",
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
    sortLabel: "Sort",
    exportCsv: "Export CSV",
    markContacted: "Mark contacted",
    clear: "Clear",
    selectedOfTotal: "selected of",
    showing: "Showing",
    clickRow: "Click a row to view lead details",
    leadsFound: "leads",
    noMatch: "No leads match these filters.",
    viewDetails: "View details",
    copyPhone: "Copy phone",
    copyWebsite: "Copy website",
    openWebsite: "Open website",
    openMaps: "Open in Maps",
    addToList: "Add to list",
    noListsMenu: "No lists yet — create one from the drawer.",
    copiedToast: "Copied",
    markedContacted: "Marked as contacted",
    savedToList: "Saved to",
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
    profileSub: "Display name and contact info for your workspace.",
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
    eyebrow: "Workspace settings",
    subtitle: "Tune Findely to match how your team prospects.",
    unsaved: "You have unsaved changes",
    discard: "Discard",
    navProfile: "Profile",
    navSearch: "Search defaults",
    navExport: "Exports",
    navAppearance: "Appearance",
    navHistory: "Lead history",
    navDeveloper: "Developers",
    navAccount: "Account",
    navDanger: "Danger zone",
    profileDesc: "Display name and contact email shown across your workspace.",
    searchDefaultsDesc:
      "Defaults applied when you open the search page with no saved query.",
    exportPrefsDesc: "Control what columns end up in your CSV exports.",
    appearanceDesc: "Theme and interface language — saved on this device.",
    historyTitle: "Lead history",
    historyDesc:
      "Findely tracks leads you've already seen on this device so new searches don't re-surface them. Clear the history to start fresh.",
    historyClearCta: "Clear history",
    historyToast: "Lead history cleared.",
    developerTitle: "API & developer tools",
    developerDesc:
      "Manage API keys and browse the integration docs without leaving settings.",
    developerOpenApi: "Manage API keys",
    developerOpenDocs: "API documentation",
    accountTitle: "Account",
    accountDesc: "Signed-in session and plan information.",
    accountSignOut: "Sign out of this device",
    dangerTitle: "Danger zone",
    dangerDesc:
      "Destructive actions affecting local data on this device. Server-side data is not touched.",
    dangerAck: "This cannot be undone.",
    seenOne: "previously seen lead",
    seenMany: "previously seen leads",
    planNameLabel: "Plan",
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
    apiCredits: "API credits",
    apiAccessTitle: "API access",
    apiAccessBodyOn:
      "Your plan includes API credits. Create a key and start integrating Findely into your stack.",
    apiAccessBodyOff:
      "API is not included on your current plan. Upgrade to Agency, API Starter, or API Pro to create keys and integrate Findely.",
    apiIncluded: "Included",
    apiNotIncluded: "Not included",
    manageApiKeys: "Manage API keys",
    compareApiPlans: "Compare API plans",
    viewApiDocs: "View API documentation",
    resetDate: "Reset date",
  },
  common: {
    open: "Open website",
    copy: "Copy phone",
    openMaps: "Open in Maps",
    fallbackUsed:
      "The selected sources are not reachable — results came from the sample source.",
  },
  auth: {
    signInTitle: "Welcome back",
    signInSubtitle: "Sign in to access your leads, lists, and searches.",
    signUpTitle: "Create your Findely account",
    signUpSubtitle: "Start your first lead search in under a minute.",
    emailLabel: "Email",
    passwordLabel: "Password",
    fullNameLabel: "Full name",
    signInCta: "Sign in",
    signUpCta: "Create account",
    signOut: "Sign out",
    haveAccount: "Already have an account?",
    noAccount: "New to Findely?",
    switchToSignIn: "Sign in",
    switchToSignUp: "Create one",
    orDivider: "or",
    openDemo: "Skip and open the demo",
    checkInbox: "Check your inbox",
    checkInboxBody:
      "We sent a confirmation link to your email. Click it to activate your account.",
    genericError: "Something went wrong. Please try again.",
    passwordMinHint: "At least 8 characters.",
    setupMissing:
      "Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and reload.",
  },
  quota: {
    exceededSearches:
      "You’ve used all your searches for this cycle. Upgrade to keep prospecting.",
    exceededLeads:
      "You’ve reached your monthly lead quota. Upgrade to fetch more leads.",
    exceededExports:
      "You’ve reached your export quota. Upgrade for unlimited exports.",
    exceededApi: "API credit quota reached for this cycle.",
    upgradeCta: "Upgrade plan",
  },
  demoMode: {
    demoBadge: "Demo data",
    realBadge: "Real data",
    banner:
      "You’re viewing sample data. Sign up to run real searches with Google Places.",
  },
  onboarding: {
    eyebrow: "Get started",
    title: "Start your first search",
    subtitle:
      "Pick a niche, a city, and Findely will prioritize the best leads to contact.",
    cta: "Run this search",
    skip: "Skip for now",
    template1Title: "Restaurants without websites in Paris",
    template1Location: "Paris",
    template1Niche: "restaurants",
    template2Title: "Dentists with phone numbers in Tel Aviv",
    template2Location: "Tel Aviv",
    template2Niche: "dentists",
    template3Title: "Real estate agents in Netanya",
    template3Location: "Netanya",
    template3Niche: "real estate agents",
  },
  plans: {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    agency: "Agency",
    apiStarter: "API Starter",
    apiPro: "API Pro",
    apiScale: "API Scale",
  },
  apiKeys: {
    title: "API keys",
    subtitle:
      "Use these keys to authenticate requests to the Findely API.",
    createTitle: "Create a new key",
    nameLabel: "Key name",
    namePlaceholder: "e.g. Production server",
    createCta: "Create key",
    creating: "Creating…",
    noKeys: "No API keys yet. Create one to start using the Findely API.",
    oneTimeWarning:
      "Copy this key now. You won’t be able to see it again.",
    copy: "Copy",
    copied: "Copied",
    done: "I’ve saved it",
    colName: "Name",
    colPrefix: "Prefix",
    colCreated: "Created",
    colLastUsed: "Last used",
    colStatus: "Status",
    active: "Active",
    revoked: "Revoked",
    revoke: "Revoke",
    revokeConfirm: "Revoke this key? Any app using it will stop working.",
    upgradeRequired:
      "API access requires an Agency or API plan. Upgrade to create keys.",
    never: "Never",
    sidebarLink: "API keys",
    intro:
      "API keys let you call the Findely v1 API from your own systems — same search pipeline as the app, scored and deduplicated leads, JSON responses.",
    howItWorksTitle: "How API keys work",
    howItWorksBullets: [
      "Name your key so you can tell environments apart.",
      "We show the full key once — copy it to a secret manager.",
      "Pass it as a Bearer token: Authorization: Bearer findely_live_…",
      "Revoke any key instantly. Revoked keys stop working on the next request.",
    ],
    planGatingTitle: "Which plans include API access?",
    planGatingBody:
      "Agency ships with light API access (1,000 credits/mo). API Starter and API Pro are dedicated API plans with larger credit pools. API Scale is custom — get in touch.",
    upgradeCtaCompare: "Compare API plans",
    upgradeCtaPricing: "View pricing",
    viewDocsCta: "View API documentation",
    currentUsageTitle: "Your current API usage",
    currentUsageBody: "Track API credits consumed this cycle on the usage page.",
    existingKeysTitle: "Existing keys",
    warningTitle: "Keep your keys safe",
  },
  developers: {
    title: "Findely API",
    subtitle:
      "A single REST endpoint for lead discovery. Same pipeline as the app — scored, deduplicated, CSV-ready.",
    gettingStarted: "Getting started",
    authTitle: "Authentication",
    authBody:
      "All requests require a Bearer token. Create keys under /app/api-keys.",
    searchTitle: "POST /api/v1/search",
    usageTitle: "GET /api/v1/usage",
    creditsTitle: "Credits",
    creditsBody:
      "Each search costs 5 credits plus 1 credit per returned lead. Your plan’s credit balance resets monthly.",
    rateLimitsTitle: "Rate limits",
    rateLimitsBody:
      "API Starter: 30 req/min. API Pro / API Scale: 120 req/min. Agency: 60 req/min.",
    errorsTitle: "Errors",
    createKeyCta: "Create an API key",
    overviewTitle: "Overview",
    overviewBody:
      "Findely exposes two endpoints. POST /api/v1/search runs a scored, deduplicated lead search. GET /api/v1/usage returns your cycle counters and credit balance. Both take a Bearer token.",
    pricingCta: "See API pricing",
    manageKeysCta: "Manage API keys",
  },
  apiPricing: {
    eyebrow: "API pricing",
    title: "Same pipeline, JSON-native.",
    subtitle:
      "Ship Findely-powered lead discovery inside your app, CRM, or internal tools. Per-request credits, no seats.",
    creditModelTitle: "How credits work",
    creditModelBullets: [
      "5 credits per search request",
      "1 credit per returned lead",
      "Credits reset on the 1st of every month (UTC)",
    ],
    starterTitle: "API Starter",
    starterBlurb:
      "Best for solo devs and MVPs plugging Findely into one product.",
    proTitle: "API Pro",
    proBlurb:
      "Best for scale-ups shipping Findely inside a paid product or internal ops tool.",
    scaleTitle: "API Scale",
    scaleBlurb:
      "Custom credit pools, dedicated rate limits, SSO and SLAs. Talk to us.",
    scalePrice: "Custom",
    monthlyCredits: "credits / month",
    viewDocs: "View API docs",
    manageKeys: "Manage API keys",
    contactScale: "Contact for Scale",
    popular: "Most popular",
    faqTitle: "API — frequently asked questions",
    faq: [
      {
        q: "What are the rate limits?",
        a: "API Starter: 30 requests/minute. API Pro and API Scale: 120 requests/minute. Agency: 60 requests/minute. Rate-limit responses include a Retry-After header.",
      },
      {
        q: "How do I upgrade my API plan?",
        a: "Email sales@findely.app with your current plan and target plan. We assign plans manually during the private beta — same day in most cases.",
      },
      {
        q: "Can I rotate a key without downtime?",
        a: "Yes. Create a second key in /app/api-keys, deploy it, then revoke the old one. Revoked keys fail with 401 on the next request.",
      },
      {
        q: "What do the 4xx error codes mean?",
        a: "401 = missing or invalid key. 402 = plan quota reached for this cycle. 403 = your plan does not include API access. 422 = validation failure (see issues[]). 429 = rate-limited — back off and retry after Retry-After.",
      },
      {
        q: "Do unused credits roll over?",
        a: "No. Credits reset on the 1st of every month (UTC). Plan a steady monthly consumption or contact us for API Scale.",
      },
      {
        q: "Is the API available on the Free and Starter plans?",
        a: "No. API access is included on Agency (1,000 credits/mo) and on the dedicated API Starter / API Pro / API Scale plans.",
      },
    ],
  },
  migration: {
    title: "Import your local data?",
    body: "We found lists and saved searches on this device. Import them into your account.",
    importCta: "Import to my account",
    dismissCta: "Not now",
    importing: "Importing…",
    imported: "Imported",
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
    developers: "Développeurs",
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
    statSources: "Sources",
    statScoring: "Scoring",
    statCleaning: "Nettoyage",
    statExport: "Export",
    badgeNoWebsite: "Sans site",
    badgeHighOpportunity: "Forte opportunité",
    badgeOutreachReady: "Prêt à contacter",
    badgeLocalBusiness: "Entreprise locale",
    badgeMissingContact: "Contact manquant",
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
    sortLabel: "Tri",
    exportCsv: "Exporter CSV",
    markContacted: "Marquer contacté",
    clear: "Effacer",
    selectedOfTotal: "sélectionnés sur",
    showing: "Affichage",
    clickRow: "Cliquez une ligne pour voir les détails",
    leadsFound: "leads",
    noMatch: "Aucun lead ne correspond.",
    viewDetails: "Voir les détails",
    copyPhone: "Copier le téléphone",
    copyWebsite: "Copier le site",
    openWebsite: "Ouvrir le site",
    openMaps: "Ouvrir dans Maps",
    addToList: "Ajouter à une liste",
    noListsMenu: "Aucune liste — créez-en une depuis le panneau.",
    copiedToast: "Copié",
    markedContacted: "Marqué contacté",
    savedToList: "Enregistré dans",
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
    profileSub: "Nom affiché et email de contact de votre espace de travail.",
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
    eyebrow: "Paramètres de l'espace",
    subtitle: "Adaptez Findely à la façon dont votre équipe prospecte.",
    unsaved: "Modifications non enregistrées",
    discard: "Annuler",
    navProfile: "Profil",
    navSearch: "Recherche",
    navExport: "Exports",
    navAppearance: "Apparence",
    navHistory: "Historique",
    navDeveloper: "Développeurs",
    navAccount: "Compte",
    navDanger: "Zone sensible",
    profileDesc:
      "Nom affiché et email affichés à travers votre espace de travail.",
    searchDefaultsDesc:
      "Valeurs appliquées par défaut lorsque vous ouvrez la page de recherche sans requête.",
    exportPrefsDesc: "Choisissez ce qui apparaît dans vos exports CSV.",
    appearanceDesc:
      "Thème et langue de l'interface — enregistrés sur cet appareil.",
    historyTitle: "Historique des leads",
    historyDesc:
      "Findely mémorise les leads déjà vus sur cet appareil pour éviter de les re-proposer. Effacez l'historique pour repartir à zéro.",
    historyClearCta: "Effacer l'historique",
    historyToast: "Historique des leads réinitialisé.",
    developerTitle: "API & outils développeurs",
    developerDesc:
      "Gérez vos clés API et consultez la documentation sans quitter les paramètres.",
    developerOpenApi: "Gérer les clés API",
    developerOpenDocs: "Documentation API",
    accountTitle: "Compte",
    accountDesc: "Informations de session et de plan.",
    accountSignOut: "Se déconnecter de cet appareil",
    dangerTitle: "Zone sensible",
    dangerDesc:
      "Actions destructives sur les données locales de cet appareil. Les données serveur ne sont pas modifiées.",
    dangerAck: "Cette action est irréversible.",
    seenOne: "lead déjà vu",
    seenMany: "leads déjà vus",
    planNameLabel: "Plan",
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
    apiCredits: "Crédits API",
    apiAccessTitle: "Accès API",
    apiAccessBodyOn:
      "Votre plan inclut des crédits API. Créez une clé et commencez à intégrer Findely à votre stack.",
    apiAccessBodyOff:
      "L'API n'est pas incluse dans votre plan actuel. Passez à Agency, API Starter ou API Pro pour créer des clés et intégrer Findely.",
    apiIncluded: "Inclus",
    apiNotIncluded: "Non inclus",
    manageApiKeys: "Gérer les clés API",
    compareApiPlans: "Comparer les offres API",
    viewApiDocs: "Voir la documentation API",
    resetDate: "Date de réinitialisation",
  },
  common: {
    open: "Ouvrir le site",
    copy: "Copier le téléphone",
    openMaps: "Ouvrir dans Maps",
    fallbackUsed:
      "Les sources sélectionnées ne sont pas disponibles — résultats issus de la source d’exemple.",
  },
  auth: {
    signInTitle: "Bon retour",
    signInSubtitle: "Connectez-vous pour accéder à vos leads, listes et recherches.",
    signUpTitle: "Créez votre compte Findely",
    signUpSubtitle: "Lancez votre première recherche en moins d’une minute.",
    emailLabel: "Email",
    passwordLabel: "Mot de passe",
    fullNameLabel: "Nom complet",
    signInCta: "Se connecter",
    signUpCta: "Créer un compte",
    signOut: "Se déconnecter",
    haveAccount: "Déjà un compte ?",
    noAccount: "Nouveau sur Findely ?",
    switchToSignIn: "Se connecter",
    switchToSignUp: "Créer un compte",
    orDivider: "ou",
    openDemo: "Ignorer et ouvrir la démo",
    checkInbox: "Vérifiez votre boîte mail",
    checkInboxBody:
      "Nous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte.",
    genericError: "Une erreur est survenue. Réessayez.",
    passwordMinHint: "Au moins 8 caractères.",
    setupMissing:
      "Supabase n’est pas encore configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local puis rechargez la page.",
  },
  quota: {
    exceededSearches:
      "Vous avez utilisé toutes vos recherches pour ce cycle. Passez à un plan supérieur pour continuer.",
    exceededLeads:
      "Vous avez atteint votre quota mensuel de leads. Passez à un plan supérieur pour en obtenir davantage.",
    exceededExports:
      "Vous avez atteint votre quota d’exports. Passez à un plan supérieur pour des exports illimités.",
    exceededApi: "Quota de crédits API atteint pour ce cycle.",
    upgradeCta: "Changer de plan",
  },
  demoMode: {
    demoBadge: "Données de démonstration",
    realBadge: "Données réelles",
    banner:
      "Vous consultez des données d’exemple. Inscrivez-vous pour lancer de vraies recherches avec Google Places.",
  },
  onboarding: {
    eyebrow: "Démarrage",
    title: "Lancez votre première recherche",
    subtitle:
      "Choisissez une niche, une ville, et Findely priorise les meilleurs leads à contacter.",
    cta: "Lancer cette recherche",
    skip: "Passer pour l’instant",
    template1Title: "Restaurants sans site à Paris",
    template1Location: "Paris",
    template1Niche: "restaurants",
    template2Title: "Dentistes avec téléphone à Tel Aviv",
    template2Location: "Tel Aviv",
    template2Niche: "dentistes",
    template3Title: "Agents immobiliers à Netanya",
    template3Location: "Netanya",
    template3Niche: "agents immobiliers",
  },
  plans: {
    free: "Gratuit",
    starter: "Starter",
    pro: "Pro",
    agency: "Agence",
    apiStarter: "API Starter",
    apiPro: "API Pro",
    apiScale: "API Scale",
  },
  apiKeys: {
    title: "Clés API",
    subtitle:
      "Utilisez ces clés pour authentifier vos requêtes à l’API Findely.",
    createTitle: "Créer une nouvelle clé",
    nameLabel: "Nom de la clé",
    namePlaceholder: "ex. Serveur de production",
    createCta: "Créer la clé",
    creating: "Création…",
    noKeys: "Aucune clé API. Créez-en une pour commencer à utiliser l’API Findely.",
    oneTimeWarning:
      "Copiez cette clé maintenant. Elle ne sera plus affichée.",
    copy: "Copier",
    copied: "Copié",
    done: "Je l’ai enregistrée",
    colName: "Nom",
    colPrefix: "Préfixe",
    colCreated: "Créée",
    colLastUsed: "Dernière utilisation",
    colStatus: "Statut",
    active: "Active",
    revoked: "Révoquée",
    revoke: "Révoquer",
    revokeConfirm:
      "Révoquer cette clé ? Toute application qui l’utilise cessera de fonctionner.",
    upgradeRequired:
      "L’accès API nécessite un plan Agence ou API. Passez à une offre supérieure pour créer des clés.",
    never: "Jamais",
    sidebarLink: "Clés API",
    intro:
      "Les clés API permettent d’appeler l’API Findely v1 depuis vos propres systèmes — même pipeline que l’app, leads scorés et dédupliqués, réponses JSON.",
    howItWorksTitle: "Comment ça marche",
    howItWorksBullets: [
      "Nommez votre clé pour distinguer vos environnements.",
      "Nous affichons la clé complète une seule fois — copiez-la dans un gestionnaire de secrets.",
      "Utilisez-la comme token Bearer : Authorization: Bearer findely_live_…",
      "Révoquez une clé à tout moment. Les clés révoquées cessent de fonctionner à la requête suivante.",
    ],
    planGatingTitle: "Quels plans incluent l’accès API ?",
    planGatingBody:
      "Agency inclut un accès API léger (1 000 crédits/mois). API Starter et API Pro sont des plans API dédiés avec de plus grands pools de crédits. API Scale est personnalisé — contactez-nous.",
    upgradeCtaCompare: "Comparer les offres API",
    upgradeCtaPricing: "Voir les tarifs",
    viewDocsCta: "Voir la documentation API",
    currentUsageTitle: "Votre utilisation API actuelle",
    currentUsageBody:
      "Suivez les crédits API consommés ce cycle sur la page d’utilisation.",
    existingKeysTitle: "Clés existantes",
    warningTitle: "Protégez vos clés",
  },
  developers: {
    title: "API Findely",
    subtitle:
      "Un endpoint REST unique pour la découverte de leads. Même pipeline que l’app — scoré, dédupliqué, prêt pour l’export CSV.",
    gettingStarted: "Démarrage",
    authTitle: "Authentification",
    authBody:
      "Toutes les requêtes nécessitent un token Bearer. Créez vos clés depuis /app/api-keys.",
    searchTitle: "POST /api/v1/search",
    usageTitle: "GET /api/v1/usage",
    creditsTitle: "Crédits",
    creditsBody:
      "Chaque recherche coûte 5 crédits plus 1 crédit par lead retourné. Votre solde de crédits se remet à zéro chaque mois.",
    rateLimitsTitle: "Limites de débit",
    rateLimitsBody:
      "API Starter : 30 req/min. API Pro / API Scale : 120 req/min. Agence : 60 req/min.",
    errorsTitle: "Erreurs",
    createKeyCta: "Créer une clé API",
    overviewTitle: "Vue d’ensemble",
    overviewBody:
      "Findely expose deux endpoints. POST /api/v1/search lance une recherche de leads scorée et dédupliquée. GET /api/v1/usage renvoie vos compteurs et votre solde de crédits. Les deux utilisent un token Bearer.",
    pricingCta: "Voir les tarifs API",
    manageKeysCta: "Gérer les clés API",
  },
  apiPricing: {
    eyebrow: "Tarifs API",
    title: "Le même pipeline, nativement JSON.",
    subtitle:
      "Intégrez la découverte de leads Findely dans votre app, CRM ou outils internes. Crédits à la requête, pas de sièges.",
    creditModelTitle: "Fonctionnement des crédits",
    creditModelBullets: [
      "5 crédits par requête de recherche",
      "1 crédit par lead retourné",
      "Les crédits se réinitialisent le 1er de chaque mois (UTC)",
    ],
    starterTitle: "API Starter",
    starterBlurb:
      "Idéal pour les devs en solo et les MVP qui intègrent Findely à un produit.",
    proTitle: "API Pro",
    proBlurb:
      "Idéal pour les scale-ups qui embarquent Findely dans un produit payant ou un outil interne.",
    scaleTitle: "API Scale",
    scaleBlurb:
      "Pools de crédits personnalisés, limites dédiées, SSO et SLA. Parlons-en.",
    scalePrice: "Sur mesure",
    monthlyCredits: "crédits / mois",
    viewDocs: "Voir la documentation API",
    manageKeys: "Gérer les clés API",
    contactScale: "Contacter pour Scale",
    popular: "Le plus populaire",
    faqTitle: "API — questions fréquentes",
    faq: [
      {
        q: "Quelles sont les limites de débit ?",
        a: "API Starter : 30 requêtes/min. API Pro et API Scale : 120 requêtes/min. Agency : 60 requêtes/min. Les réponses 429 incluent un en-tête Retry-After.",
      },
      {
        q: "Comment passer à un plan API supérieur ?",
        a: "Écrivez à sales@findely.app en indiquant votre plan actuel et le plan cible. L'affectation des plans se fait manuellement pendant la beta privée — en général le jour même.",
      },
      {
        q: "Puis-je faire tourner une clé sans coupure ?",
        a: "Oui. Créez une seconde clé dans /app/api-keys, déployez-la, puis révoquez l'ancienne. Les clés révoquées renvoient 401 dès la requête suivante.",
      },
      {
        q: "Que signifient les codes d'erreur 4xx ?",
        a: "401 = clé manquante ou invalide. 402 = quota du plan atteint ce cycle. 403 = votre plan n'inclut pas l'accès API. 422 = validation échouée (voir issues[]). 429 = limite dépassée — attendez et réessayez après Retry-After.",
      },
      {
        q: "Les crédits non utilisés sont-ils reportés ?",
        a: "Non. Les crédits se réinitialisent le 1er de chaque mois (UTC). Planifiez une consommation mensuelle stable ou contactez-nous pour API Scale.",
      },
      {
        q: "L'API est-elle disponible sur les plans Gratuit et Starter ?",
        a: "Non. L'accès API est inclus sur Agency (1 000 crédits/mois) et sur les plans dédiés API Starter / API Pro / API Scale.",
      },
    ],
  },
  migration: {
    title: "Importer vos données locales ?",
    body: "Nous avons trouvé des listes et recherches enregistrées sur cet appareil. Importez-les dans votre compte.",
    importCta: "Importer dans mon compte",
    dismissCta: "Pas maintenant",
    importing: "Import en cours…",
    imported: "Importé",
  },
};

const DICTS: Record<Locale, Dict> = { en, fr };
const LS_KEY = "findely:locale";
const LOCALE_EVENT = "findely:locale-change";

interface I18nContextValue {
  locale: Locale;
  t: Dict;
  setLocale: (locale: Locale) => void;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

function subscribeLocale(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  window.addEventListener(LOCALE_EVENT, cb as EventListener);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LOCALE_EVENT, cb as EventListener);
  };
}

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw === "fr" ? "fr" : "en";
  } catch {
    return "en";
  }
}

function getServerLocaleSnapshot(): Locale {
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = React.useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  );

  const setLocale = React.useCallback((next: Locale) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LS_KEY, next);
      } catch {
        // Ignore quota/serialization issues.
      }
      try {
        window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: next }));
      } catch {
        // CustomEvent unavailable — non-fatal.
      }
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
