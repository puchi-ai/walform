import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormStore, FormDef } from '../store/useFormStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDisconnectWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  LayoutTemplate, 
  Settings, 
  LogOut, 
  Clock, 
  Trash2, 
  Copy, 
  Search, 
  ArrowUpDown, 
  MoreVertical, 
  Eye, 
  Sun, 
  Moon, 
  List as ListIcon, 
  LayoutGrid,
  Zap,
  Globe,
  Share2,
  Check,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  FileEdit,
  BarChart3,
  ArrowUpRight,
  Download,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { TEMPLATES as FORM_TEMPLATES } from '../config/templates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
// Removed AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer from recharts

export default function Dashboard() {
  const { forms, createForm, createFromTemplate, cloneForm, deleteForm } = useFormStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'forms' | 'marketplace'>('forms');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const { fetchIndexedForms } = useFormStore();

  useEffect(() => {
    if (user?.address) {
      fetchIndexedForms(user.address);
    }
  }, [user?.address, fetchIndexedForms]);

  const filteredForms = useMemo(() => {
    let result = forms.filter(f => 
      (f.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [forms, searchQuery, sortBy]);

  const handleCreate = (template?: any) => {
    let newForm;
    if (template) {
      newForm = createFromTemplate(template);
      toast.success('Template applied!', {
        description: `Created new form from ${template.title} template.`,
      });
    } else {
      newForm = createForm("Untitled Form");
      toast.success('Blank form created!');
    }
    navigate(`/builder/${newForm.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteForm(id, signAndExecute);
      toast.error('Form deleted', {
        description: 'The form and all its responses have been removed from Nami Cloud and Sui.',
      });
    } catch (e: any) {
      toast.error('Deletion failed', {
        description: `Failed to delete: ${e.message || 'Unknown error'}`,
      });
    }
  };

  const handleClone = (id: string) => {
    cloneForm(id);
    toast.success('Form cloned successfully!');
  };

  const handleLogout = () => {
    disconnect();
    logout();
    toast.info('Logged out securely');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 glass-nav">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold tracking-tight text-lg flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 glass-button-primary rounded flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-white" />
            </div>
            Walrus Form
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 mr-4">
              <button onClick={() => setActiveTab('forms')} className={`text-sm font-medium transition-colors ${activeTab === 'forms' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>Forms</button>
              <button onClick={() => setActiveTab('marketplace')} className={`text-sm font-medium transition-colors ${activeTab === 'marketplace' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>Marketplace</button>
            </nav>
            <div className="h-4 w-px bg-border hidden md:block" />
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <span className="text-sm text-muted-foreground hidden md:inline-block max-w-[150px] truncate">
              {user?.email || user?.address}
            </span>

            {user?.address && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="hidden md:flex gap-2 border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all rounded-full h-9 px-4 font-semibold text-xs shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" /> Disconnect
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full overflow-hidden border border-border shrink-0")}>
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {(user?.email || user?.address || '?').charAt(0).toUpperCase()}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> zkLogin Active
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <Settings className="w-4 h-4" /> Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2 cursor-pointer font-medium">
                  <LogOut className="w-4 h-4" /> {user?.address ? 'Disconnect Wallet' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              {activeTab === 'forms' ? 'Forms' : 'Marketplace'}
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === 'forms' && (
              <Button onClick={handleCreate} className="glass-button-primary rounded-full px-6 h-11 flex-1 md:flex-none">
                <Plus className="w-5 h-5 mr-2" />
                New Form
              </Button>
            )}
          </div>
        </div>

        {activeTab === 'forms' ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search forms..." 
                  className="pl-10 glass-input h-10 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 gap-2 border-border/50 text-muted-foreground")}>
                    <ArrowUpDown className="w-4 h-4" />
                    {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Title'}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('title')}>Title (A-Z)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="h-8 w-px bg-border/50 mx-1" />
                
                <div className="flex bg-muted p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content View */}
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredForms.map((form) => (
                    <FormCard key={form.id} form={form} navigate={navigate} cloneForm={handleClone} deleteForm={handleDelete} />
                  ))}
                  {filteredForms.length === 0 && <EmptyState searchQuery={searchQuery} handleCreate={handleCreate} />}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel border-border/40 rounded-xl overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 bg-secondary/30">
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Fields</th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Created</th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {filteredForms.map((form) => (
                          <FormRow key={form.id} form={form} navigate={navigate} cloneForm={handleClone} deleteForm={handleDelete} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredForms.length === 0 && <EmptyState searchQuery={searchQuery} handleCreate={handleCreate} isList />}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <MarketplaceTab handleCreate={handleCreate} />
        )}
      </main>
    </div>
  );
}

function FormCard({ form, navigate, cloneForm, deleteForm }: { form: FormDef, navigate: any, cloneForm: any, deleteForm: any }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/f/${form.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group glass-panel hover:border-primary/50 transition-all h-full flex flex-col overflow-hidden relative">
      <div className="h-24 bg-primary/5 flex items-center justify-center border-b border-border/50 relative">
        <LayoutTemplate className="w-8 h-8 text-primary/20 group-hover:scale-110 transition-transform" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Dialog>
            <DialogTrigger render={<Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" />}>
              <Share2 className="w-4 h-4" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Share Form</DialogTitle>
                <DialogDescription>
                  Share this decentralized link to start collecting responses.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-4">
                <Input defaultValue={shareUrl} readOnly className="bg-secondary/10" />
                <Button size="sm" className="px-3" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* ... */}
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/builder/${form.id}`)}>
            {form.title}
          </h3>
          <FormActions form={form} navigate={navigate} cloneForm={cloneForm} deleteForm={deleteForm} />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">
          {form.description || "No description provided."}
        </p>
        <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${form.isPublished ? 'bg-green-500' : 'bg-orange-500'}`} />
            {form.isPublished ? 'Live' : 'Draft'}
          </span>
          <span className="flex items-center gap-1 font-bold">
            <Database className="w-3 h-3" /> {form.submissionsCount || 0} Responses
          </span>
          <span>{format(new Date(form.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function FormRow({ form, navigate, cloneForm, deleteForm }: { form: FormDef, navigate: any, cloneForm: any, deleteForm: any }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/f/${form.id}`;

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Lỗi sao chép', {
        description: 'Mã lỗi: CLIP_LIST_02. Vui lòng liên hệ hỗ trợ tại trang chủ.',
      });
    }
  };

  return (
    <tr className="hover:bg-secondary/20 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/builder/${form.id}`)}>{form.title}</span>
          <span className="text-xs text-muted-foreground truncate max-w-xs">{form.description || "No description"}</span>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${form.isPublished ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${form.isPublished ? 'bg-green-600 animate-pulse' : 'bg-orange-600'}`} />
          {form.isPublished ? 'Live' : 'Draft'}
        </span>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell text-xs font-bold text-muted-foreground uppercase">
        <div className="flex flex-col">
          <span>{form.fields.length} {form.fields.length === 1 ? 'Field' : 'Fields'}</span>
          <span className="text-primary/70">{form.submissionsCount || 0} Responses</span>
        </div>
      </td>
      <td className="px-6 py-3 hidden sm:table-cell text-xs text-muted-foreground font-mono">
        {format(new Date(form.createdAt), 'MMM d, yyyy')}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Dialog>
            <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}>
              <Share2 className="w-4 h-4" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Share Form</DialogTitle>
                <DialogDescription>
                  Share this decentralized link to start collecting responses.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-4">
                <Input defaultValue={shareUrl} readOnly className="bg-secondary/10" />
                <Button size="sm" className="px-3" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigate(`/builder/${form.id}`)}>
            <Eye className="w-4 h-4" />
          </Button>
          <FormActions form={form} navigate={navigate} cloneForm={cloneForm} deleteForm={deleteForm} />
        </div>
      </td>
    </tr>
  );
}

function FormActions({ form, navigate, cloneForm, deleteForm }: { form: FormDef, navigate: any, cloneForm: any, deleteForm: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground focus:ring-0")}>
        <MoreVertical className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="gap-2" onClick={() => navigate(`/builder/${form.id}`)}>
          <FileEdit className="w-4 h-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => cloneForm(form.id)}>
          <Copy className="w-4 h-4" /> Clone
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => navigate(`/analytics/${form.id}`)}>
          <BarChart3 className="w-4 h-4" /> View Results
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => window.open(`/p/${form.id}`, '_blank')}>
          <Eye className="w-4 h-4" /> Private Preview
        </DropdownMenuItem>
        {form.isPublished && (
          <DropdownMenuItem className="gap-2 text-primary" onClick={() => window.open(`/f/${form.id}`, '_blank')}>
            <ArrowUpRight className="w-4 h-4" /> Open Public Form
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => deleteForm(form.id)}>
          <Trash2 className="w-4 h-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState({ searchQuery, handleCreate, isList }: { searchQuery: string, handleCreate: () => void, isList?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${isList ? '' : 'col-span-full py-24'}`}>
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <LayoutTemplate className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground">
        {searchQuery ? 'No forms matching your search' : 'No forms yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1">
        {searchQuery ? `Try adjusting your search terms to find what you're looking for.` : "Create your first decentralized form to start collecting responses."}
      </p>
      {!searchQuery && (
        <Button onClick={handleCreate} className="mt-6 glass-button-primary rounded-full px-8 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Create First Form
        </Button>
      )}
    </div>
  );
}

function MarketplaceTab({ handleCreate }: { handleCreate: (template?: any) => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {FORM_TEMPLATES.map((tpl) => (
          <Card key={tpl.id} className="group glass-panel hover:border-primary/50 transition-all flex flex-col overflow-hidden relative shadow-lg hover:shadow-2xl hover:-translate-y-1 duration-300">
            <div className="h-44 relative overflow-hidden bg-primary/5 border-b border-border/50">
              <img 
                src={tpl.previewUrl} 
                alt={tpl.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                 <Dialog>
                    <DialogTrigger render={<Button variant="secondary" size="sm" className="rounded-full gap-2" />}>
                       <Eye className="w-4 h-4" /> Preview
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{tpl.title}</DialogTitle>
                        <DialogDescription>Template Overview & Fields</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <div className="aspect-video rounded-xl overflow-hidden shadow-inner">
                          <img src={tpl.previewUrl} className="w-full h-full object-cover" alt="Preview"/>
                        </div>
                        <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Included Fields</h4>
                          <div className="flex flex-wrap gap-2">
                            {tpl.fields?.map((f: any) => (
                              <span key={f.id} className="px-2 py-1 rounded-md bg-background border border-border/50 text-[10px] font-medium">{f.label}</span>
                            ))}
                          </div>
                        </div>
                        <Button onClick={() => handleCreate(tpl)} className="w-full rounded-full h-12 font-bold mt-2">
                           Use this Theme
                        </Button>
                      </div>
                    </DialogContent>
                 </Dialog>
              </div>
            </div>
            <CardContent className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{tpl.category}</span>
              </div>
              <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors text-lg tracking-tight">{tpl.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-6 flex-1 italic">{tpl.description}</p>
              <Button onClick={() => handleCreate(tpl)} variant="secondary" className="w-full rounded-full text-xs font-bold h-11 border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all">
                Choose Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Removed AnalyticsTab and StatCard because they are no longer used
