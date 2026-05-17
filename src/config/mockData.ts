import { FormDef, FormField } from '../store/useFormStore';

export const MOCK_FORMS: FormDef[] = [
  {
    id: "demo-form-1",
    title: "Waitlist Registration",
    description: "Join the Web3 revolution with Walrus Form.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    walrusObjectId: "0x123...456",
    fields: [
      { id: "f1", type: "shortText", label: "Full Name", required: true, placeholder: "Enter your full name" },
      { id: "f2", type: "email", label: "Email Address", required: true, placeholder: "name@example.com" },
      { id: "f3", type: "dropdown", label: "Role", required: false, options: ["Developer", "Designer", "Manager", "Other"] }
    ],
    themeConfig: {
      primaryColor: '#2563eb',
      borderRadius: '1.5rem'
    }
  },
  {
    id: "demo-form-2",
    title: "User Experience Survey",
    description: "Tell us how we can improve our decentralized tools.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isPublished: false,
    fields: [
      { id: "f1", type: "longText", label: "How was your experience?", required: true },
      { id: "f2", type: "radio", label: "Would you recommend us?", required: true, options: ["Yes", "No", "Maybe"] }
    ]
  }
];

export const FIELD_TYPES_CONFIG = [
  { type: 'shortText', label: 'Short Text', icon: 'Type' },
  { type: 'longText', label: 'Long Text', icon: 'AlignLeft' },
  { type: 'number', label: 'Number', icon: 'Hash' },
  { type: 'email', label: 'Email', icon: 'AtSign' },
  { type: 'url', label: 'URL', icon: 'Link' },
  { type: 'radio', label: 'Multiple Choice', icon: 'List' },
  { type: 'checkbox', label: 'Checkboxes', icon: 'CheckSquare' },
  { type: 'dropdown', label: 'Dropdown', icon: 'ChevronDown' },
  { type: 'date', label: 'Date', icon: 'Calendar' },
  { type: 'image', label: 'Image Upload', icon: 'Image' },
  { type: 'file', label: 'Attachment', icon: 'Paperclip' },
  { type: 'video', label: 'Video', icon: 'Video' },
  { type: 'section', label: 'Section Heading', icon: 'Layout' },
  { type: 'pageBreak', label: 'Page Break', icon: 'Scissors' },
];
