import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormStore, FieldType, FormField, ValidationRules } from '../store/useFormStore';
import { useThemeStore } from '../store/useThemeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { 
  ArrowLeft, 
  GripVertical, 
  Plus, 
  Settings, 
  Type, 
  AlignLeft, 
  Hash, 
  AtSign, 
  CheckSquare, 
  List, 
  Calendar, 
  ChevronRight, 
  UploadCloud, 
  LayoutTemplate,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  Video,
  Heading1,
  Scissors,
  Palette,
  Eye,
  PanelLeft,
  PanelRight,
  ChevronDown,
  Trash2,
  X,
  Star
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PublicForm from './PublicForm';

const FIELD_TYPES: { type: FieldType; icon: any; label: string; group: string }[] = [
  { type: 'shortText', icon: Type, label: 'Short Text', group: 'Basic' },
  { type: 'longText', icon: AlignLeft, label: 'Long Text', group: 'Basic' },
  { type: 'number', icon: Hash, label: 'Number', group: 'Basic' },
  { type: 'email', icon: AtSign, label: 'Email', group: 'Basic' },
  { type: 'url', icon: LinkIcon, label: 'URL', group: 'Basic' },
  { type: 'radio', icon: CheckSquare, label: 'Single Choice', group: 'Selection' },
  { type: 'checkbox', icon: CheckSquare, label: 'Checkboxes', group: 'Selection' },
  { type: 'dropdown', icon: List, label: 'Dropdown', group: 'Selection' },
  { type: 'starRating', icon: Star, label: 'Star Rating', group: 'Selection' },
  { type: 'date', icon: Calendar, label: 'Date', group: 'Basic' },
  { type: 'image', icon: ImageIcon, label: 'Image Upload', group: 'Media' },
  { type: 'file', icon: Paperclip, label: 'Attachment', group: 'Media' },
  { type: 'video', icon: Video, label: 'Video (<10MB)', group: 'Media' },
  { type: 'section', icon: Heading1, label: 'Section', group: 'Layout' },
  { type: 'pageBreak', icon: Scissors, label: 'Page Break', group: 'Layout' },
];

export default function Builder({ isNew = false }: { isNew?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentForm, loadForm, createForm, updateCurrentForm, addField, updateField, removeField, reorderFields, publishForm } = useFormStore();
  const { mode } = useThemeStore();

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'designer' | 'preview'>('designer');

  useEffect(() => {
    if (isNew || id === 'new') {
      const newForm = createForm("Untitled Form");
      navigate(`/builder/${newForm.id}`, { replace: true });
    } else if (id) {
      loadForm(id);
    }
  }, [id, isNew, loadForm, createForm, navigate]);

  // Auto-close sidebars on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      } else {
        setLeftSidebarOpen(true);
        setRightSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && currentForm && currentForm.fields) {
      const oldIndex = currentForm.fields.findIndex((f) => f.id === active.id);
      const newIndex = currentForm.fields.findIndex((f) => f.id === over.id);
      reorderFields(oldIndex, newIndex);
    }
  };

  const handleAddField = (type: FieldType) => {
    addField({
      type,
      label: type === 'section' ? 'New Section' : `New ${type.replace(/([A-Z])/g, ' $1').toLowerCase()} field`,
      required: type !== 'section' && type !== 'pageBreak',
      options: (type === 'radio' || type === 'dropdown' || type === 'checkbox') ? ['Option 1', 'Option 2'] : undefined
    });
  };

  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const onPublish = async () => {
    try {
      setIsPublishing(true);
      await publishForm(signAndExecute);
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentForm) return null;

  const selectedField = currentForm.fields?.find(f => f.id === selectedFieldId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Topbar */}
      <header className="h-16 border-b glass-nav flex items-center justify-between px-4 md:px-6 shrink-0 relative z-50">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 overflow-hidden">
            <LayoutTemplate className="w-5 h-5 text-primary hidden sm:block shrink-0" />
            <input 
              value={currentForm.title || ''} 
              onChange={(e) => updateCurrentForm({ title: e.target.value })}
              className="h-9 border-none bg-transparent font-bold px-1 rounded-lg outline-none w-full max-w-[200px] sm:max-w-xs truncate"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className={`h-9 w-9 transition-colors ${leftSidebarOpen ? 'text-primary' : 'text-muted-foreground'}`}>
               <PanelLeft className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className={`h-9 w-9 transition-colors ${rightSidebarOpen ? 'text-primary' : 'text-muted-foreground'}`}>
               <PanelRight className="w-5 h-5" />
             </Button>
          </div>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto h-9 bg-secondary/50 rounded-full p-1 flex items-center">
            <TabsList className="bg-transparent h-full grid grid-cols-2 gap-1 px-1">
              <TabsTrigger value="designer" className="rounded-full h-full px-3 sm:px-4 text-[10px] sm:text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Design</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-full h-full px-3 sm:px-4 text-[10px] sm:text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Preview</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" onClick={() => window.open(`/p/${currentForm.id}`, '_blank')} className="h-9 gap-2 hidden sm:flex">
            <Eye className="w-4 h-4" /> Preview
          </Button>
          
          <Button size="sm" onClick={onPublish} disabled={isPublishing} className="glass-button-primary rounded-full px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm">
            {isPublishing ? 'Publishing...' : 'Publish'}
            {!isPublishing && <UploadCloud className="w-4 h-4 ml-2 hidden sm:block" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Fields Palette */}
        {leftSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm" 
            onClick={() => setLeftSidebarOpen(false)}
          />
        )}
        <aside 
          className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 lg:w-64 border-r glass-sidebar flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-64'} bg-card lg:bg-background/40`}
        >
          <div className="p-4 border-b flex items-center justify-between bg-card lg:bg-transparent">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Add Fields</h3>
            <Button variant="ghost" size="icon" onClick={() => setLeftSidebarOpen(false)} className="lg:hidden h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {['Basic', 'Selection', 'Media', 'Layout'].map((group) => (
                <div key={group}>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground/60 mb-3 ml-1 tracking-wider">{group}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {FIELD_TYPES.filter(ft => ft.group === group).map((ft) => (
                      <button
                        key={ft.type}
                        onClick={() => {
                          handleAddField(ft.type);
                          if (window.innerWidth < 1024) setLeftSidebarOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 text-sm font-medium rounded-xl border border-secondary bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all text-foreground group text-left"
                      >
                        <ft.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        <span className="flex-1">{ft.label}</span>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Editor Stage */}
        <main className="flex-1 builder-canvas overflow-y-auto relative p-4 md:p-8 lg:p-12 z-0 scroll-smooth">
          {activeTab === 'designer' ? (
            <div className="max-w-2xl mx-auto space-y-6 pb-24">
              <div className="text-center mb-8 glass-panel p-8 md:p-12 rounded-[2rem] border-border/50">
                <input 
                  type="text"
                  value={currentForm.title || ''}
                  onChange={(e) => updateCurrentForm({ title: e.target.value })}
                  className="bg-transparent border-none text-3xl md:text-4xl font-bold text-center w-full outline-none placeholder:text-muted-foreground/30 py-2 text-foreground tracking-tight"
                  placeholder="Untitled Form"
                />
                <textarea 
                  value={currentForm.description || ''}
                  onChange={(e) => updateCurrentForm({ description: e.target.value })}
                  className="bg-transparent border-none text-base md:text-lg text-muted-foreground text-center w-full outline-none mt-2 placeholder:text-muted-foreground/30 resize-none overflow-hidden"
                  placeholder="Describe your form..."
                  rows={2}
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                  }}
                />
              </div>

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={(currentForm.fields || []).map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {(currentForm.fields || []).map((field) => (
                      <SortableFieldItem 
                        key={field.id} 
                        field={field} 
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => {
                          setSelectedFieldId(field.id);
                          if (window.innerWidth < 1024) setRightSidebarOpen(true);
                        }}
                        onRemove={() => { removeField(field.id); if(selectedFieldId === field.id) setSelectedFieldId(null); }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {(currentForm.fields || []).length === 0 && (
                <div className="text-center py-24 border-2 border-dashed border-border rounded-[2rem] bg-secondary/20 flex flex-col items-center gap-4 text-muted-foreground">
                  <LayoutTemplate className="w-16 h-16 opacity-10" />
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Your form is empty</p>
                    <p className="text-sm">Click "Fields" to start adding inputs.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full max-w-4xl mx-auto glass-panel rounded-[2rem] overflow-hidden shadow-2xl relative bg-background">
              <div className="absolute top-4 left-4 p-2 bg-primary/10 text-primary rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase z-[60] animate-pulse pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-primary" /> Live Preview
              </div>
              <div className="h-full w-full overflow-y-auto preview-scroll-container">
                <PublicForm preview={true} formDef={currentForm} />
              </div>
            </div>
          )}
        </main>

        {/* Right Properties Panel */}
        {rightSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm" 
            onClick={() => setRightSidebarOpen(false)}
          />
        )}
        <aside 
          className={`fixed lg:relative inset-y-0 right-0 z-40 w-80 border-l glass-sidebar flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:-mr-80'} bg-card lg:bg-background/40`}
        >
          <div className="p-4 flex items-center justify-between border-b bg-card lg:bg-transparent">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Configuration</h3>
            <Button variant="ghost" size="icon" onClick={() => setRightSidebarOpen(false)} className="lg:hidden h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="properties" className="w-full flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 border-b bg-secondary/20">
              <TabsList className="w-full grid grid-cols-2 bg-transparent">
                <TabsTrigger value="properties" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Properties</TabsTrigger>
                <TabsTrigger value="theme" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Theme</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 overflow-y-auto">
              <TabsContent value="properties" className="p-0 m-0">
                {selectedField ? (
                  <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FieldPropertiesPanel field={selectedField} updateField={updateField} />
                    
                    {/* Validation Settings */}
                    {selectedField.type !== 'section' && selectedField.type !== 'pageBreak' && (
                      <ValidationSettingsPanel field={selectedField} updateField={updateField} />
                    )}
                    
                    <div className="pt-6 border-t border-border">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full h-11 rounded-xl"
                        onClick={() => { removeField(selectedField.id); setSelectedFieldId(null); }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Field
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-64 opacity-40">
                    <Settings className="w-10 h-10 mb-4" />
                    <p className="text-sm font-medium">Select a field on the canvas to edit its properties.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="theme" className="p-6 m-0 space-y-8">
                <ThemeSettingsPanel currentForm={currentForm} updateCurrentForm={updateCurrentForm} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function FieldPropertiesPanel({ field, updateField }: { field: FormField, updateField: any }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center gap-2">
          Label Text <ChevronRight className="w-3 h-3" />
        </Label>
        <Input 
          value={field.label} 
          onChange={(e) => updateField(field.id, { label: e.target.value })}
          className="glass-input h-11 rounded-xl"
        />
      </div>

      {(field.type !== 'section' && field.type !== 'pageBreak' && field.type !== 'image' && field.type !== 'video') && (
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center gap-2">
            Placeholder <ChevronRight className="w-3 h-3" />
          </Label>
          <Input 
            value={field.placeholder || ''} 
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            className="glass-input h-11 rounded-xl"
          />
        </div>
      )}

      {field.type === 'section' && (
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60">Section Content (Markdown)</Label>
          <textarea 
             value={field.content || ''} 
             onChange={(e) => updateField(field.id, { content: e.target.value })}
             className="glass-input w-full p-3 rounded-xl min-h-[120px] resize-none text-sm"
             placeholder="Add instructions or details for this section..."
          />
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border/40">
        <div className="space-y-0.5">
          <Label htmlFor="required" className="text-sm font-semibold">Requirement</Label>
          <p className="text-[10px] text-muted-foreground">Force users to answer</p>
        </div>
        <Switch 
          id="required" 
          checked={field.required} 
          onCheckedChange={(c) => updateField(field.id, { required: c })}
        />
      </div>

      {(field.type === 'radio' || field.type === 'dropdown' || field.type === 'checkbox') && (
        <div className="space-y-3 pt-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60">Options List</Label>
          <div className="space-y-2">
            {(field.options || []).map((opt, i) => (
               <div key={i} className="flex gap-2 group/opt">
                 <Input 
                   value={opt} 
                   onChange={(e) => {
                     const newOpts = [...(field.options || [])];
                     newOpts[i] = e.target.value;
                     updateField(field.id, { options: newOpts });
                   }}
                   className="glass-input h-10 rounded-xl flex-1"
                 />
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-10 w-10 text-muted-foreground hover:text-destructive opacity-0 group-hover/opt:opacity-100 transition-opacity" 
                   onClick={() => {
                   const newOpts = [...(field.options || [])];
                   newOpts.splice(i, 1);
                   updateField(field.id, { options: newOpts });
                 }}>
                   <X className="w-4 h-4" />
                 </Button>
               </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-10 rounded-xl border-dashed border-2 hover:border-primary/50 text-xs gap-2"
            onClick={() => {
              updateField(field.id, { options: [...(field.options || []), `Option ${(field.options?.length||0)+1}`] });
            }}
          >
            <Plus className="w-4 h-4" /> Add New Option
          </Button>
        </div>
      )}
    </div>
  );
}

function ValidationSettingsPanel({ field, updateField }: { field: FormField, updateField: any }) {
  const v = field.validation || {};
  
  const updateValidation = (updates: Partial<ValidationRules>) => {
    updateField(field.id, { validation: { ...v, ...updates } });
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-bold tracking-tight">Validation Rules</h4>
      </div>

      {(field.type === 'shortText' || field.type === 'longText' || field.type === 'number') && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Min Value/Len</Label>
            <Input 
              type="number" 
              value={v.min || ''} 
              onChange={(e) => updateValidation({ min: parseInt(e.target.value) || undefined })}
              className="glass-input h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Max Value/Len</Label>
            <Input 
              type="number" 
              value={v.max || ''} 
              onChange={(e) => updateValidation({ max: parseInt(e.target.value) || undefined })}
              className="glass-input h-10 rounded-xl"
            />
          </div>
        </div>
      )}

      {(field.type === 'image' || field.type === 'file' || field.type === 'video') && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Max Size (MB)</Label>
            <Input 
              type="number" 
              value={v.maxSizeMB || ''} 
              onChange={(e) => updateValidation({ maxSizeMB: parseInt(e.target.value) || undefined })}
              placeholder="e.g. 10"
              className="glass-input h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Allowed Extensions</Label>
            <Input 
              placeholder="e.g. .jpg, .png, .pdf"
              value={v.allowedTypes?.join(', ') || ''}
              onChange={(e) => updateValidation({ allowedTypes: e.target.value.split(',').map(s => s.trim()) })}
              className="glass-input h-10 rounded-xl"
            />
          </div>
        </div>
      )}

      {field.type === 'shortText' && (
        <div className="space-y-2">
           <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">Format Pattern (Regex)</Label>
           <Input 
             placeholder="^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"
             value={v.pattern || ''}
             onChange={(e) => updateValidation({ pattern: e.target.value })}
             className="glass-input h-10 rounded-xl font-mono text-xs"
           />
        </div>
      )}
    </div>
  );
}

function ThemeSettingsPanel({ currentForm, updateCurrentForm }: { currentForm: any, updateCurrentForm: any }) {
  const theme = currentForm.themeConfig || { primaryColor: '#2563eb', mode: 'glass', fieldStyle: 'default' };
  
  const updateTheme = (updates: any) => {
    updateCurrentForm({ themeConfig: { ...theme, ...updates } });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center gap-2">
          Theme Mode <Palette className="w-3 h-3" />
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
            { id: 'glass', label: 'Glass' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => updateTheme({ mode: m.id })}
              className={`py-3 px-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme.mode === m.id ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/30'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60">Field Style</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'default', label: 'Default' },
            { id: 'filled', label: 'Filled' },
            { id: 'underlined', label: 'Underline' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => updateTheme({ fieldStyle: s.id })}
              className={`py-3 px-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme.fieldStyle === s.id ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/30'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center gap-2">
          Brand Color <Palette className="w-3 h-3" />
        </Label>
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-xl overflow-hidden cursor-pointer relative"
          >
            <input 
              type="color" 
              value={theme.primaryColor} 
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              className="absolute inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] cursor-pointer"
            />
          </div>
          <Input 
            value={theme.primaryColor} 
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            className="glass-input h-12 rounded-xl flex-1 uppercase font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60">Border Style</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '0.25rem', label: 'Boxy' },
            { id: '0.75rem', label: 'Balanced' },
            { id: '1.5rem', label: 'Soft' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => updateTheme({ borderRadius: r.id })}
              className={`py-3 px-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${theme.borderRadius === r.id ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/30'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60">Background Image URL</Label>
        <Input 
          placeholder="https://images.unsplash.com/..."
          value={theme.backgroundImage || ''}
          onChange={(e) => updateTheme({ backgroundImage: e.target.value })}
          className="glass-input h-11 rounded-xl"
        />
        <p className="text-[10px] text-muted-foreground italic">Tip: Use Unsplash URLs for high-quality decentralized backgrounds.</p>
      </div>
    </div>
  );
}

function SortableFieldItem({ field, isSelected, onSelect, onRemove }: { field: FormField, isSelected: boolean, onSelect: () => void, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0
  };

  const Icon = FIELD_TYPES.find(f => f.type === field.type)?.icon || Type;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative rounded-[1.5rem] p-6 transition-all cursor-pointer select-none ring-offset-background ${isSelected ? 'glass-panel border-primary ring-2 ring-primary/20 shadow-2xl' : 'glass-panel border-transparent hover:border-primary/20 shadow-sm'}`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <div 
        className="absolute left-1 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-all rounded-lg"
        {...attributes} 
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="pl-6 md:pl-8 pr-12">
        {(field.type === 'section' || field.type === 'pageBreak') ? (
          <div className="flex items-center gap-4 py-2">
            <div className={`p-3 rounded-2xl ${field.type === 'section' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className={`text-xl font-bold truncate ${field.type === 'section' ? 'text-foreground' : 'text-muted-foreground uppercase tracking-widest text-xs'}`}>
                {field.label}
              </h4>
              {field.type === 'section' && field.content && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{field.content}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <Label className="text-base md:text-lg font-bold block text-foreground leading-snug">
                {field.label} {field.required && <span className="text-primary ml-1">*</span>}
              </Label>
              <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground/50 border border-border/50">
                 <Icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="opacity-50 pointer-events-none">
              <FieldVisualPlaceholder field={field} />
            </div>
          </>
        )}
      </div>

      {/* Field Actions Overlay (Top Right) */}
      <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 rounded-lg shadow-sm border border-border"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function FieldVisualPlaceholder({ field }: { field: FormField }) {
  if (['shortText', 'email', 'number', 'url'].includes(field.type)) {
     return <Input disabled placeholder={field.placeholder || "Enter text..."} className="glass-input h-12 rounded-xl bg-secondary/30 pointer-events-none" />;
  }
  if (field.type === 'longText') {
    return <div className="h-28 w-full rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground/30 font-medium">Write everything here...</div>;
  }
  if (field.type === 'radio' || field.type === 'checkbox') {
    return (
      <div className="space-y-3 pt-1">
        {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 border-2 border-border ${field.type === 'radio' ? 'rounded-full' : 'rounded-md shadow-inner'}`} />
            <span className="text-sm font-medium text-muted-foreground">{opt}</span>
          </div>
        ))}
      </div>
    );
  }
  if (field.type === 'dropdown') {
    return (
      <div className="h-12 w-full glass-input rounded-xl bg-secondary/30 flex items-center justify-between px-4">
        <span className="text-sm text-muted-foreground/50">Select an option</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
      </div>
    );
  }
  if (field.type === 'date') {
    return (
      <div className="h-12 w-full glass-input rounded-xl bg-secondary/30 flex items-center px-4 gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground/40" />
        <span className="text-sm text-muted-foreground/50">MM / DD / YYYY</span>
      </div>
    );
  }
  if (field.type === 'starRating') {
    return (
      <div className="flex items-center gap-2 pt-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className="w-8 h-8 text-yellow-500/30" />
        ))}
      </div>
    );
  }
  if (field.type === 'image' || field.type === 'video' || field.type === 'file') {
    return (
      <div className="h-24 md:h-32 w-full rounded-2xl border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center gap-2">
        <UploadCloud className="w-8 h-8 text-muted-foreground/30" />
        <span className="text-xs font-bold text-muted-foreground/50 tracking-wider">CLICK OR DRAG TO UPLOAD</span>
      </div>
    );
  }
  return null;
}
