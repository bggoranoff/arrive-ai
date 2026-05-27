// Mock data for 3 supported application types.
// Documents with an `imageKey` field reference bundled assets in assets/documents/.

// Template checklists for each application type.
// When a user creates a new application, these define the required documents.
export const applicationTemplates = {
  anmeldung: {
    icon: 'Home',
    title: 'Address registration (Anmeldung)',
    description:
      'Register your new address at the Bürgeramt. Required within 14 days of moving in.',
    requiredDocs: [
      'Wohnungsgeberbestätigung (landlord confirmation)',
      'Anmeldeformular (registration form)',
      'Passport or national ID card',
      'Marriage certificate (if married)',
      'Birth certificate for children (if applicable)',
      'Residence permit or visa (non-EU citizens)',
    ],
  },
  'blue-card': {
    icon: 'IdCard',
    title: 'EU Blue Card',
    description:
      'Apply for a work permit for skilled non-EU workers at the Ausländerbehörde.',
    requiredDocs: [
      'Valid passport (color copy)',
      'Employment contract or job offer',
      'Employer job description form (Erklärung zum Beschäftigungsverhältnis)',
      'University degree certificate',
      'ZAB Statement of Comparability (if foreign degree)',
      'Health insurance proof',
      'Registration certificate (Meldebestätigung)',
      'Landlord confirmation (Wohnungsgeberbestätigung)',
      'Lease agreement (Mietvertrag)',
      'Biometric passport photo',
    ],
  },
  kindergeld: {
    icon: 'Baby',
    title: 'Child benefit (Kindergeld)',
    description:
      'Apply for €259/month child benefit from the Familienkasse. Both parents must sign the KG1 form.',
    requiredDocs: [
      'KG1 main application form',
      'KG1-AnK child appendix (one per child)',
      'Child birth certificate (+ certified translation if foreign)',
      'Tax ID (yours)',
      'Tax ID (child)',
      'Copy of residence permit (non-EU citizens)',
      'Registration certificate (Anmeldebestätigung)',
      'Passport or ID',
      'German bank account details (IBAN)',
    ],
  },
};

export const initialApplications = [
  {
    id: 'anmeldung',
    icon: 'Home',
    title: 'Address registration (Anmeldung)',
    progressPct: 33,
    isNew: false,
    docsRequired: 6,
    createdAt: '2026-05-20T10:30:00.000Z',
    overview: {
      description: applicationTemplates.anmeldung.description,
      steps: applicationTemplates.anmeldung.requiredDocs.map((text, i) => ({
        text,
        done: i < 2,
      })),
    },
    documents: [
      {
        id: 'doc-anm-wgb',
        icon: 'FileText',
        name: 'Wohnungsgeberbestätigung',
        status: 'Scanned',
        imageKey: 'wohnungsgeberbestaetigung',
        summary:
          'Landlord confirmation of move-in, required by law (§19 BMG). Your landlord fills in their name, the apartment address, and the move-in date, then signs it. You must bring this to the Bürgeramt — a rental contract does not replace it.',
      },
      {
        id: 'doc-anm-form',
        icon: 'FileSignature',
        name: 'Anmeldeformular',
        status: 'Scanned',
        imageKey: 'anmeldung',
        summary:
          'The official registration form you submit at the Bürgeramt. Contains your personal details — name, date of birth, nationality, marital status, previous address, and new address. You can pre-fill it at home or complete it at the appointment.',
      },
    ],
    deadlines: [
      { day: 3, month: 6, year: 2026, label: 'Bürgeramt appointment' },
      { day: 10, month: 6, year: 2026, label: '14-day registration deadline' },
    ],
    nextDeadline: { day: 3, monthName: 'June', label: 'Bürgeramt appointment' },
    calendarMonth: { month: 5, year: 2026, monthName: 'June' },
  },
  {
    id: 'kindergeld',
    icon: 'Baby',
    title: 'Child benefit (Kindergeld)',
    progressPct: 22,
    isNew: false,
    docsRequired: 9,
    createdAt: '2026-05-22T14:15:00.000Z',
    overview: {
      description: applicationTemplates.kindergeld.description,
      steps: applicationTemplates.kindergeld.requiredDocs.map((text, i) => ({
        text,
        done: i < 2,
      })),
    },
    documents: [
      {
        id: 'doc-kg-form',
        icon: 'FileSignature',
        name: 'KG1 — Antrag auf Kindergeld',
        status: 'Scanned',
        imageKey: 'kg1_antrag',
        summary:
          'The main Kindergeld application form. Contains your personal data, tax ID, bank details (IBAN), and information about the other parent. Both parents must sign it. Submit to your local Familienkasse.',
      },
      {
        id: 'doc-kg-ank',
        icon: 'FileSignature',
        name: 'KG1-AnK — Anlage Kind',
        status: 'Scanned',
        imageKey: 'kg1_anlage_kind',
        summary:
          'Child appendix to the Kindergeld application — one form per child. Lists the child\'s name, date of birth, tax ID, and residence. For children over 18, additional sections cover education or training status.',
      },
    ],
    deadlines: [
      { day: 15, month: 6, year: 2026, label: 'Submit Kindergeld application' },
    ],
    nextDeadline: { day: 15, monthName: 'June', label: 'submit application' },
    calendarMonth: { month: 5, year: 2026, monthName: 'June' },
  },
]

export const applicationCatalog = [
  {
    id: 'anmeldung',
    icon: 'Home',
    title: 'Address registration (Anmeldung)',
    subtitle: 'Register at the Bürgeramt within 14 days',
  },
  {
    id: 'blue-card',
    icon: 'IdCard',
    title: 'EU Blue Card',
    subtitle: 'Work permit for skilled non-EU workers',
  },
  {
    id: 'kindergeld',
    icon: 'Baby',
    title: 'Child benefit (Kindergeld)',
    subtitle: '€259/month per child from the Familienkasse',
  },
]
