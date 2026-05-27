// All data is static and lives only in memory. The app mutates a copy of this
// in App-level state to support adding applications and documents.

export const initialApplications = [
  {
    id: 'residence',
    icon: 'IdCard',
    title: 'Residence permit extension',
    progressPct: 60,
    isNew: false,
    docsRequired: 5,
    overview: {
      description: 'Renew your residence title before the current one expires.',
      steps: [
        { text: 'Scan your current permit', done: true },
        { text: 'Book an appointment', done: false },
        { text: 'Upload proof of income', done: false },
      ],
    },
    documents: [
      { id: 'doc-residence-1', icon: 'FileText', name: 'Current permit', status: 'Scanned' },
      { id: 'doc-residence-2', icon: 'FileText', name: 'Passport copy', status: 'Scanned' },
      { id: 'doc-residence-3', icon: 'FileSignature', name: 'Application form', status: 'In review' },
    ],
    deadlines: [
      { day: 4, month: 5, year: 2026, label: 'Appointment confirmation due' },
      { day: 11, month: 5, year: 2026, label: 'Submit application form' },
      { day: 25, month: 5, year: 2026, label: 'Final renewal deadline' },
    ],
    nextDeadline: { day: 11, monthName: 'June', label: 'submit form' },
    calendarMonth: { month: 5, year: 2026, monthName: 'June' }, // 0-indexed month (5 = June)
  },
  {
    id: 'kindergeld',
    icon: 'Baby',
    title: 'Child benefit (Kindergeld)',
    progressPct: 25,
    isNew: false,
    docsRequired: 4,
    overview: {
      description: 'Apply for monthly child support from the Familienkasse.',
      steps: [
        { text: 'Add child birth certificate', done: true },
        { text: 'Fill out the KG1 form', done: false },
        { text: 'Add proof of address', done: false },
        { text: 'Submit to Familienkasse', done: false },
      ],
    },
    documents: [
      { id: 'doc-kg-1', icon: 'FileText', name: 'Birth certificate', status: 'Scanned' },
    ],
    deadlines: [
      { day: 18, month: 5, year: 2026, label: 'Submit KG1 form' },
    ],
    nextDeadline: { day: 18, monthName: 'June', label: 'submit KG1 form' },
    calendarMonth: { month: 5, year: 2026, monthName: 'June' },
  },
  {
    id: 'address',
    icon: 'Home',
    title: 'Address registration',
    progressPct: 100,
    isNew: false,
    docsRequired: 4,
    overview: {
      description: 'Register your new address with the Bürgeramt.',
      steps: [
        { text: 'Scan tenancy agreement', done: true },
        { text: 'Add landlord confirmation', done: true },
        { text: 'Book Bürgeramt appointment', done: true },
        { text: 'Receive Anmeldung confirmation', done: true },
      ],
    },
    documents: [
      { id: 'doc-addr-1', icon: 'FileText', name: 'Tenancy agreement', status: 'Scanned' },
      { id: 'doc-addr-2', icon: 'FileText', name: 'Landlord confirmation', status: 'Scanned' },
      { id: 'doc-addr-3', icon: 'FileSignature', name: 'Anmeldung form', status: 'Submitted' },
      { id: 'doc-addr-4', icon: 'BadgeCheck', name: 'Anmeldung confirmation', status: 'Received' },
    ],
    deadlines: [],
    nextDeadline: null,
    calendarMonth: { month: 5, year: 2026, monthName: 'June' },
  },
  {
    id: 'tax-id',
    icon: 'Receipt',
    title: 'Tax ID request',
    progressPct: 5,
    isNew: true,
    docsRequired: 3,
    overview: {
      description: 'Request a German tax ID (Steueridentifikationsnummer) for income tax.',
      steps: [
        { text: 'Add Anmeldung confirmation', done: false },
        { text: 'Fill out the request form', done: false },
        { text: 'Send by post to BZSt', done: false },
      ],
    },
    documents: [],
    deadlines: [
      { day: 30, month: 5, year: 2026, label: 'Send request by post' },
    ],
    nextDeadline: { day: 30, monthName: 'June', label: 'send by post' },
    calendarMonth: { month: 5, year: 2026, monthName: 'June' },
  },
]

// Catalog shown in the Add-application bottom sheet. Items already in the list
// are filtered out at render time.
export const applicationCatalog = [
  {
    id: 'residence',
    icon: 'IdCard',
    title: 'Residence permit extension',
    subtitle: 'Renew your residence title',
  },
  {
    id: 'kindergeld',
    icon: 'Baby',
    title: 'Child benefit (Kindergeld)',
    subtitle: 'Monthly support from the Familienkasse',
  },
  {
    id: 'address',
    icon: 'Home',
    title: 'Address registration',
    subtitle: 'Register your new address',
  },
  {
    id: 'tax-id',
    icon: 'Receipt',
    title: 'Tax ID request',
    subtitle: 'Get your Steueridentifikationsnummer',
  },
  {
    id: 'driver-licence',
    icon: 'Car',
    title: "Driver's licence conversion",
    subtitle: 'Convert a foreign licence',
  },
  {
    id: 'health-insurance',
    icon: 'HeartPulse',
    title: 'Health insurance enrolment',
    subtitle: 'Sign up with a Krankenkasse',
  },
  {
    id: 'bank-account',
    icon: 'Landmark',
    title: 'Bank account opening',
    subtitle: 'Open a German current account',
  },
  {
    id: 'pension',
    icon: 'PiggyBank',
    title: 'Pension registration',
    subtitle: 'Get your social security number',
  },
]

// Canned chat thread shown when opening a document.
export const initialChatThread = [
  {
    id: 'm1',
    role: 'assistant',
    text: "I've read your form. Ask me about any field you're unsure how to fill.",
  },
  {
    id: 'm2',
    role: 'user',
    text: 'What do I put in field 7?',
  },
  {
    id: 'm3',
    role: 'assistant',
    text: 'Field 7 is your current address. Use the address shown on your Anmeldung confirmation.',
  },
]

// Stock replies used when the user types a message in the chat input. Cycles
// through; nothing here calls a real model.
export const cannedReplies = [
  "Good question. Use the same address you registered at the Bürgeramt.",
  "You can leave that blank if it doesn't apply to your situation.",
  "Attach a copy of your most recent payslip — three months is usually enough.",
  "If you're unsure, the Familienkasse helpline can confirm it for your case.",
]
