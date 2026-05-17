import { FormDef } from '../store/useFormStore';

export interface FormTemplate extends Partial<FormDef> {
  id: string;
  title: string;
  description: string;
  category: string;
  previewUrl: string;
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: 't1',
    title: 'DAO Proposal Feedback',
    description: 'Get community consensus on governance proposals with encrypted responses.',
    category: 'Governance',
    previewUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&auto=format&fit=crop&q=60',
    fields: [
      { id: 'f1', type: 'shortText', label: 'Proposal ID', required: true },
      { id: 'f2', type: 'radio', label: 'Vote', options: ['Approve', 'Reject', 'Abstain'], required: true },
      { id: 'f3', type: 'longText', label: 'Reasoning', placeholder: 'Explain your vote...', required: false }
    ],
    themeConfig: { primaryColor: '#7c3aed', borderRadius: '0.5rem', mode: 'dark', fieldStyle: 'filled' }
  },
  {
    id: 't2',
    title: 'Secure Bug Bounty Report',
    description: 'Allow researchers to submit vulnerabilities securely via Walrus storage.',
    category: 'Security',
    previewUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60',
    fields: [
      { id: 'f1', type: 'shortText', label: 'Component Name', required: true },
      { id: 'f2', type: 'dropdown', label: 'Severity', options: ['Critical', 'High', 'Medium', 'Low'], required: false },
      { id: 'f3', type: 'longText', label: 'Steps to Reproduce', required: true },
      { id: 'f4', type: 'shortText', label: 'Proof of Concept URL', required: false }
    ],
    themeConfig: { primaryColor: '#dc2626', borderRadius: '0.25rem', mode: 'dark', fieldStyle: 'underlined' }
  },
  {
    id: 't3',
    title: 'Customer Satisfaction NPS',
    description: 'Standard product feedback form with a clean, modern aesthetic.',
    category: 'Business',
    previewUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60',
    fields: [
      { id: 'f1', type: 'number', label: 'How likely are you to recommend us? (0-10)', required: true },
      { id: 'f2', type: 'longText', label: 'What is the primary reason for your score?', required: false },
      { id: 'f3', type: 'dropdown', label: 'How did you hear about us?', options: ['Twitter', 'Friend', 'Ad', 'Other'], required: false }
    ],
    themeConfig: { primaryColor: '#059669', borderRadius: '1.5rem', mode: 'glass', fieldStyle: 'filled' }
  },
  {
    id: 't4',
    title: 'Product Waitlist',
    description: 'Build hype for your DApp with a high-converting landing page form.',
    category: 'Marketing',
    previewUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=60',
    fields: [
      { id: 'f1', type: 'email', label: 'Early Access Email', required: true },
      { id: 'f2', type: 'shortText', label: 'Twitter Handle (@username)', required: false },
      { id: 'f3', type: 'dropdown', label: 'Primary Use Case', options: ['Individual', 'Developer', 'Enterprise'], required: false }
    ],
    themeConfig: { primaryColor: '#ea580c', borderRadius: '2rem', mode: 'light', fieldStyle: 'default' }
  },
  {
    id: 't5',
    title: 'NFT Creator Application',
    description: 'Curate your marketplace by collecting artist portfolios safely.',
    category: 'Art',
    previewUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60',
    fields: [
      { id: 'f1', type: 'shortText', label: 'Artist Name', required: true },
      { id: 'f2', type: 'shortText', label: 'Portfolio Link', required: true },
      { id: 'f3', type: 'longText', label: 'Bio / Artistic Vision', required: true }
    ],
    themeConfig: { primaryColor: '#db2777', borderRadius: '1rem', mode: 'glass', fieldStyle: 'underlined' }
  },
  {
    id: 't6',
    title: 'Employee Onboarding',
    description: 'Internal form for collecting basic employee information securely.',
    category: 'HR',
    previewUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=60',
    fields: [
      { id: 'f1', type: 'shortText', label: 'Legal Name', required: true },
      { id: 'f2', type: 'shortText', label: 'Emergency Contact', required: false },
      { id: 'f3', type: 'dropdown', label: 'Department', options: ['Engineering', 'Marketing', 'Sales', 'Design'], required: false }
    ],
    themeConfig: { primaryColor: '#2563eb', borderRadius: '0.75rem', mode: 'light', fieldStyle: 'filled' }
  },
  {
    id: 't7',
    title: 'Sui Global Community Quiz',
    description: 'Engage your community with a fun quiz about the ecosystem.',
    category: 'Community',
    previewUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60',
    fields: [
      { id: 'f1', type: 'shortText', label: 'What does Move power?', required: true },
      { id: 'f2', type: 'shortText', label: 'Who created Walrus?', required: true },
      { id: 'f3', type: 'radio', label: 'Best Network?', options: ['Sui', 'Others? (Wrong answer)'], required: true }
    ],
    themeConfig: { primaryColor: '#6366f1', borderRadius: '2rem', mode: 'glass', fieldStyle: 'filled' }
  }
];
