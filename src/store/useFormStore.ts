import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type FieldType = 'shortText' | 'longText' | 'number' | 'email' | 'url' | 'radio' | 'checkbox' | 'dropdown' | 'date' | 'image' | 'file' | 'video' | 'section' | 'pageBreak' | 'starRating';

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For radio, dropdown, checkbox
  placeholder?: string;
  description?: string;
  validation?: ValidationRules;
  content?: string; // For images, videos, or section descriptions
}

export interface FormThemeConfig {
  primaryColor: string;
  backgroundColor?: string;
  backgroundImage?: string;
  fontFamily?: string;
  borderRadius?: string;
  mode?: 'light' | 'dark' | 'glass';
  fieldStyle?: 'default' | 'underlined' | 'filled';
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  blobId?: string; // S3 Object Key (formerly Walrus Blob ID)
  status?: 'unread' | 'read' | 'archive';
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface FormDef {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  walrusObjectId?: string; // S3 Key
  metadataObjectId?: string; // SUI Metadata Object ID
  owner?: string;
  themeConfig?: FormThemeConfig;
  submissionsCount?: number;
}

interface FormState {
  forms: FormDef[];
  submissions: Record<string, FormSubmission[]>;
  currentForm: FormDef | null;
  createForm: (title: string) => FormDef;
  createFromTemplate: (template: any) => FormDef;
  loadForm: (id: string) => Promise<void> | void;
  updateCurrentForm: (updates: Partial<FormDef>) => void;
  addField: (field: Omit<FormField, 'id'>) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  publishForm: (signAndExecute: (tx: any) => Promise<any>) => Promise<void>;
  fetchIndexedForms: (address: string) => Promise<void>;
  fetchFormResponses: (formBlobId: string) => Promise<any[]>;
  cloneForm: (id: string) => void;
  deleteForm: (id: string, signAndExecute?: (tx: any) => Promise<any>) => Promise<void>;
  getSubmissions: (formId: string) => FormSubmission[];
  updateSubmission: (formId: string, submissionId: string, updates: Partial<FormSubmission>) => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: [],
  submissions: {}, // FormId -> Submission[]
  currentForm: null,
  createForm: (title) => {
    const newForm: FormDef = {
      id: uuidv4(),
      title,
      description: "",
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
    };
    set((state) => ({ forms: [newForm, ...state.forms], currentForm: newForm }));
    return newForm;
  },
  createFromTemplate: (template) => {
    const newForm: FormDef = {
      ...template,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
      submissionsCount: 0
    };
    set((state) => ({ forms: [newForm, ...state.forms], currentForm: newForm }));
    return newForm;
  },
  loadForm: async (id) => {
    const form = get().forms.find(f => f.id === id);
    if (form) {
      set({ currentForm: form });
    } else {
      try {
        const { walrus } = await import('../services/walrus');
        const formDef = await walrus.getBlob(id);
        if (formDef) {
          set({ currentForm: formDef });
        }
      } catch (error) {
        console.error('Failed to load form from S3:', error);
      }
    }
  },
  updateCurrentForm: (updates) => {
    set((state) => {
      if (!state.currentForm) return state;
      const updatedForm = { 
        ...state.currentForm, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      return {
        currentForm: updatedForm,
        forms: state.forms.map(f => f.id === updatedForm.id ? updatedForm : f)
      };
    });
  },
  addField: (field) => {
    const newField = { ...field, id: uuidv4() };
    set((state) => {
      if (!state.currentForm) return state;
      const updatedForm = { 
        ...state.currentForm, 
        fields: [...(state.currentForm.fields || []), newField],
        updatedAt: new Date().toISOString()
      };
      return {
        currentForm: updatedForm,
        forms: state.forms.map(f => f.id === updatedForm.id ? updatedForm : f)
      };
    });
  },
  updateField: (id, updates) => {
    set((state) => {
      if (!state.currentForm) return state;
      const updatedFields = (state.currentForm.fields || []).map(f => f.id === id ? { ...f, ...updates } : f);
      const updatedForm = { 
        ...state.currentForm, 
        fields: updatedFields,
        updatedAt: new Date().toISOString()
      };
      return {
        currentForm: updatedForm,
        forms: state.forms.map(f => f.id === updatedForm.id ? updatedForm : f)
      };
    });
  },
  removeField: (id) => {
    set((state) => {
      if (!state.currentForm) return state;
      const updatedFields = (state.currentForm.fields || []).filter(f => f.id !== id);
      const updatedForm = { ...state.currentForm, fields: updatedFields };
      return {
        currentForm: updatedForm,
        forms: state.forms.map(f => f.id === updatedForm.id ? updatedForm : f)
      };
    });
  },
  reorderFields: (startIndex, endIndex) => {
    set((state) => {
      if (!state.currentForm) return state;
      const result = Array.from(state.currentForm.fields || []);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      const updatedForm = { ...state.currentForm, fields: result };
      return {
        currentForm: updatedForm,
        forms: state.forms.map(f => f.id === updatedForm.id ? updatedForm : f)
      };
    });
  },
  publishForm: async (signAndExecute: (tx: any) => Promise<any>) => {
    const { currentForm } = get();
    if (!currentForm) return;

    try {
      const { walrus } = await import('../services/walrus');

      // Check if it's already published (meaning this is an EDIT / UPDATE operation)
      if (currentForm.isPublished && currentForm.walrusObjectId) {
        // 1. Update form definition in S3
        await walrus.updateBlob(currentForm.walrusObjectId, currentForm);
        
        // 2. Update index on Sui if we have metadataObjectId
        if (currentForm.metadataObjectId) {
          const tx = walrus.updateIndexTx(currentForm.metadataObjectId, currentForm.title, currentForm.description);
          await signAndExecute({ transaction: tx });
        }
        
        set((state) => {
          if (!state.currentForm) return state;
          const updatedForm = { 
            ...state.currentForm, 
            updatedAt: new Date().toISOString()
          };
          return {
            currentForm: updatedForm,
            forms: state.forms.map(f => f.id === updatedForm.id ? updatedForm : f)
          };
        });
      } else {
        // This is a new POST / PUBLISH operation
        // 1. Publish Form Definition to S3 using its ID directly as the S3 key
        const publishedForm = { ...currentForm, isPublished: true };
        await walrus.updateBlob(currentForm.id, publishedForm);
        const blobId = currentForm.id;
        
        // 2. Index on Sui using Move Contract
        const tx = walrus.createIndexTx(blobId, currentForm.title, currentForm.description);
        const result = await signAndExecute({ 
          transaction: tx,
          options: {
            showObjectChanges: true
          }
        });
        
        if (result.digest) {
          // Extract the created BlobMetadata object ID on-chain
          let metadataObjectId = '';
          if (result.objectChanges) {
            const createdObj = result.objectChanges.find(
              (change: any) => change.type === 'created' && change.objectType.endsWith('::blob_index::BlobMetadata')
            );
            if (createdObj) {
              metadataObjectId = createdObj.objectId;
            }
          }

          set((state) => {
            if (!state.currentForm) return state;
            const updatedForm = { 
              ...state.currentForm, 
              isPublished: true, 
              walrusObjectId: blobId, // S3 Object Key
              metadataObjectId: metadataObjectId || undefined
            };
            return {
              currentForm: updatedForm,
              forms: state.forms.map(f => f.id === updatedForm.id ? updatedForm : f)
            };
          });
        }
      }
    } catch (error) {
      console.error('Publishing/Republishing failed:', error);
      throw error;
    }
  },
  fetchIndexedForms: async (address: string) => {
    try {
      const { SuiJsonRpcClient, getJsonRpcFullnodeUrl } = await import('@mysten/sui/jsonRpc');
      const network = (import.meta.env.VITE_SUI_NETWORK === 'mainnet') ? 'mainnet' : 'testnet';
      const client = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl(network), network });
      const { walrus } = await import('../services/walrus');
      
      const objects = await client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${import.meta.env.VITE_CONTRACT_PACKAGE_ID}::blob_index::BlobMetadata`
        },
        options: { showContent: true }
      });

      // Parse objects and fetch full definitions from S3 in parallel
      const indexedForms = await Promise.all(objects.data.map(async (obj: any) => {
        const fields = obj.data?.content?.fields;
        const blobId = fields.blob_id;
        
        try {
          // Fetch full form JSON schema from S3 proxy
          const fullForm = await walrus.getBlob(blobId);
          if (fullForm) {
            return {
              ...fullForm,
              isPublished: true,
              walrusObjectId: blobId,
              metadataObjectId: obj.data?.objectId,
              owner: fields.owner
            };
          }
        } catch (err) {
          console.warn(`Failed to fetch S3 blob for indexed form ${blobId}:`, err);
        }

        // Fallback to basic metadata if S3 fetch fails
        return {
          id: blobId,
          title: fields.name,
          description: fields.description,
          createdAt: new Date(Number(fields.created_at)).toISOString(),
          updatedAt: new Date(Number(fields.created_at)).toISOString(),
          isPublished: true,
          walrusObjectId: blobId,
          metadataObjectId: obj.data?.objectId,
          owner: fields.owner,
          fields: []
        };
      }));

      if (indexedForms.length > 0) {
        set((state) => ({
          forms: [...indexedForms, ...state.forms.filter(f => !indexedForms.find(ifm => ifm.id === f.id))]
        }));
      }
    } catch (error) {
      console.error('Fetching indexed forms failed:', error);
    }
  },
  fetchFormResponses: async (formBlobId: string) => {
    try {
      const { walrus } = await import('../services/walrus');
      
      // Fetch responses directly from S3 (no on-chain gas or wallet lookup needed)
      const list = await walrus.getResponses(formBlobId);
      
      return list.map(item => ({
        id: item.id,
        answers: item.data,
        createdAt: item.submittedAt,
        isEncrypted: false
      }));
    } catch (error) {
      console.error('Fetching responses failed:', error);
      return [];
    }
  },
  cloneForm: (id) => {
    const formToClone = get().forms.find(f => f.id === id);
    if (formToClone) {
      const clonedForm: FormDef = {
        ...formToClone,
        id: uuidv4(),
        title: `${formToClone.title} (Copy)`,
        createdAt: new Date().toISOString(),
        isPublished: false,
        walrusObjectId: undefined,
        metadataObjectId: undefined,
      };
      set((state) => ({ forms: [clonedForm, ...state.forms] }));
    }
  },
  deleteForm: async (id, signAndExecute) => {
    const formToDelete = get().forms.find(f => f.id === id);
    if (formToDelete) {
      try {
        const { walrus } = await import('../services/walrus');
        
        // 1. Delete from S3
        if (formToDelete.walrusObjectId) {
          await walrus.deleteBlob(formToDelete.walrusObjectId);
        }
        
        // 2. Delete index on-chain
        if (formToDelete.metadataObjectId && signAndExecute) {
          const tx = walrus.deleteIndexTx(formToDelete.metadataObjectId);
          await signAndExecute({ transaction: tx });
        }
      } catch (e) {
        console.error('Failed to fully delete form from S3/Sui:', e);
      }
    }

    set((state) => ({ forms: state.forms.filter(f => f.id !== id) }));
  },
  getSubmissions: (formId) => {
    return get().submissions[formId] || [];
  },
  updateSubmission: (formId, submissionId, updates) => {
    set(state => {
      const formSubmissions = state.submissions[formId] || [];
      const updatedSubmissions = formSubmissions.map(s => 
        s.id === submissionId ? { ...s, ...updates } : s
      );
      return {
        submissions: { ...state.submissions, [formId]: updatedSubmissions }
      };
    });
  }
}));
