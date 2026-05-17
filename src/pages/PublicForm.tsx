import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFormStore, FormField, FormDef } from '../store/useFormStore';
import { useThemeStore } from '../store/useThemeStore';
// Walletless form response submission enabled
import { walrus } from '../services/walrus';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  UploadCloud, 
  Paperclip, 
  ImageIcon, 
  Video, 
  ArrowLeft,
  Settings,
  EyeOff,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { FileUploader } from '../components/FileUploader';

export default function PublicForm({ preview = false, formDef }: { preview?: boolean, formDef?: FormDef }) {
  const { id } = useParams();
  const { loadForm, currentForm: storeForm } = useFormStore();
  const { mode } = useThemeStore();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [uploadedBlobId, setUploadedBlobId] = useState<string | null>(null);

  // Use the passed formDef (highly prioritized for live preview) or the one from the store
  const currentForm = formDef || storeForm;

  useEffect(() => {
    if (id && !formDef) loadForm(id);
  }, [id, loadForm, formDef]);

  if (!currentForm) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  const isFormAccessible = preview || currentForm.isPublished;

  if (!isFormAccessible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
           <EyeOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">Form Offline</h1>
          <p className="text-muted-foreground max-w-sm">This form is currently private or restricted. Contact the owner for access.</p>
        </div>
        <Link 
          to="/" 
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
           Back to Walrus Form
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) return;
    setIsSubmitting(true);
    
    try {
      // 1. Submit response directly to S3 via secure proxy backend (absolutely no wallet/Sui transaction required!)
      const responseId = await walrus.submitResponse(currentForm.id, answers);
      console.log('Stored response on AWS S3:', responseId);
      setUploadedBlobId(responseId);

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Successfully submitted!', {
        description: 'Your response has been securely saved.',
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
      toast.error('Submission failed', {
        description: `Error: ${(error as any).message || 'Unknown error'}. Please try again.`,
        duration: 10000,
      });
    }
  };

  const pages = currentForm.fields.reduce((acc, field) => {
    if (field.type === 'pageBreak') {
      acc.push([]);
    } else {
      acc[acc.length - 1].push(field);
    }
    return acc;
  }, [[]] as FormField[][]);

  const currentFields = pages[activePage] || [];
  const theme = currentForm.themeConfig || { primaryColor: '#2563eb', mode: 'glass' };

  const getContainerStyles = () => {
    switch (theme.mode) {
      case 'dark': return 'dark bg-slate-950 text-slate-50';
      case 'light': return 'light bg-white text-slate-900';
      case 'glass': return 'bg-slate-950/40 text-slate-50 backdrop-blur-xl';
      default: return 'bg-background text-foreground';
    }
  };

  const getCardStyles = () => {
    switch (theme.mode) {
      case 'light': return 'bg-slate-50 border border-slate-200/80 shadow-md text-slate-900';
      case 'dark': return 'bg-slate-900/60 border border-slate-800 shadow-md text-slate-50';
      case 'glass': return 'glass-panel border border-white/10 shadow-lg text-slate-100';
      default: return 'glass-panel border-border/50 shadow-lg text-foreground';
    }
  };

  if (isSuccess) {
    return (
      <div className={cn(preview ? "h-full min-h-[600px]" : "min-h-screen", "bg-transparent flex items-center justify-center p-6 bg-background relative overflow-hidden")}>
        {/* Dynamic Theme Background */}
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-md w-full text-center space-y-6 glass-panel rounded-3xl p-12 shadow-2xl relative z-10 border-border/50"
        >
           <div 
             className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
             style={{ backgroundColor: `${theme.primaryColor}20` }}
           >
             <CheckCircle2 className="w-10 h-10" style={{ color: theme.primaryColor }} />
           </div>
           <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Securely Stored</h1>
           <p className="text-muted-foreground leading-relaxed">
             Your response has been securely saved to Nami Cloud and fully indexed on-chain on the Sui blockchain.
           </p>
           <div className="p-4 bg-secondary/50 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 text-sm font-mono text-foreground border border-border">
              <Database className="w-4 h-4 text-muted-foreground" />
              walrus://{uploadedBlobId ? `${uploadedBlobId.slice(0, 8)}...${uploadedBlobId.slice(-8)}` : 'walrus-blob-id'}
           </div>
           <Link 
             to="/" 
             className={cn(buttonVariants(), "rounded-full w-full")} 
             style={{ backgroundColor: theme.primaryColor }}
           >
              Create Your Own Form
           </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={cn(
      preview ? "h-full min-h-[600px]" : "min-h-screen", 
      "transition-colors duration-500 relative", 
      getContainerStyles(), 
      theme.backgroundImage ? 'bg-transparent' : '',
      theme.mode === 'glass' && !theme.backgroundImage ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950' : ''
    )}>
      {/* Custom Theme Background */}
      {theme.backgroundImage && (
        <div 
           className={cn("z-0 bg-cover bg-center", preview ? "absolute inset-0" : "fixed inset-0")}
           style={{ backgroundImage: `url(${theme.backgroundImage})`, filter: theme.mode === 'dark' ? 'brightness(0.3) contrast(1.2)' : 'brightness(0.8)' }}
        />
      )}

      {/* Preview Banner */}
      {preview && (
        <div className="absolute top-0 inset-x-0 h-10 bg-primary/20 backdrop-blur-md flex items-center justify-center text-xs font-bold uppercase tracking-widest text-primary z-[100] border-b border-primary/20">
          <Settings className="w-3 h-3 mr-2 animate-spin-slow" /> Preview Mode — Submissions are disabled
        </div>
      )}

      <div className={cn("relative z-10 py-16 px-4 sm:px-6 flex flex-col", preview ? "h-full pt-20" : "min-h-screen")}>
        <div className="max-w-2xl mx-auto w-full flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 tracking-tighter text-foreground drop-shadow-sm">
                {currentForm.title}
              </h1>
              {currentForm.description && (
                <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-tight">
                  {currentForm.description}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-32">
              <AnimatePresence mode="wait">
                <motion.div
                   key={activePage}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                >
                  {currentFields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      {field.type === 'section' ? (
                        <div className="py-8 border-b border-border/50">
                           <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">{field.label}</h2>
                           {field.content && (
                             <div className="prose prose-invert text-muted-foreground text-base">
                               <Markdown>{field.content}</Markdown>
                             </div>
                           )}
                        </div>
                      ) : (
                        <div 
                          className={cn("p-6 sm:p-8 md:p-10 transition-all hover:border-primary/20", getCardStyles())}
                          style={{ borderRadius: theme.borderRadius || '1.5rem' }}
                        >
                            <Label className="text-lg sm:text-xl font-bold leading-tight text-foreground block mb-6">
                              {field.label}
                              {field.required && <span className="ml-1" style={{ color: theme.primaryColor }}>*</span>}
                              {field.description && <p className="text-sm font-normal text-muted-foreground mt-2">{field.description}</p>}
                            </Label>
                            
                            <div className="relative">
                              <FieldRenderer field={field} answers={answers} setAnswers={setAnswers} theme={theme} />
                            </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-10 flex flex-col items-center gap-8"
              >
                <div className="flex gap-4 w-full justify-center">
                   {activePage > 0 && (
                     <Button 
                       type="button" 
                       onClick={() => setActivePage(p => p - 1)}
                       variant="outline"
                       className="h-14 sm:h-16 px-8 rounded-full border-2 text-lg font-bold"
                     >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                     </Button>
                   )}
                   
                   {activePage < pages.length - 1 ? (
                     <Button 
                        type="button" 
                        onClick={() => setActivePage(p => p + 1)}
                        className="h-14 sm:h-16 px-10 text-lg font-bold rounded-full text-white"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Next Section
                     </Button>
                   ) : (
                     <Button 
                        type="submit" 
                        className="h-14 sm:h-16 px-10 sm:px-14 text-lg sm:text-xl font-black rounded-full shadow-2xl transition-all hover:scale-[1.02] active:scale-95 text-white" 
                        style={{ backgroundColor: theme.primaryColor, boxShadow: `0 10px 40px -10px ${theme.primaryColor}80` }}
                        disabled={isSubmitting || preview}
                      >
                        {isSubmitting ? 'Securing Response...' : 'Submit Form Securely'}
                      </Button>
                   )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                   <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure Nami Cloud</div>
                   <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Sui On-Chain Indexed</div>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FieldRenderer({ field, answers, setAnswers, theme }: { field: FormField, answers: any, setAnswers: any, theme: any }) {
  const getFieldBaseClasses = () => {
    const base = "h-14 transition-all w-full outline-none px-4 flex items-center";
    const status = "focus:ring-4 ring-primary/10";
    
    let textStyle = "text-foreground placeholder:text-muted-foreground";
    if (theme.mode === 'light') {
      textStyle = "text-slate-900 placeholder:text-slate-400";
    } else if (theme.mode === 'dark') {
      textStyle = "text-slate-50 placeholder:text-slate-500";
    } else if (theme.mode === 'glass') {
      textStyle = "text-slate-100 placeholder:text-slate-400";
    }
    
    switch (theme.fieldStyle) {
      case 'underlined':
        return cn(base, "bg-transparent border-b-2 border-border/50 focus:border-primary rounded-none px-0", status, textStyle);
      case 'filled':
        const filledBg = theme.mode === 'light' ? 'bg-slate-200/50 focus:bg-slate-200/80 border-none' : 'bg-secondary/40 focus:bg-secondary/60 border-none';
        return cn(base, filledBg, "rounded-xl", status, textStyle);
      default:
        const defaultBg = theme.mode === 'light' ? 'bg-white border border-slate-200 focus:border-primary/50' : 'bg-secondary/20 focus:bg-secondary/40 border border-border/50 focus:border-primary/50';
        return cn(base, defaultBg, "rounded-xl", status, textStyle);
    }
  };

  const getOptionClasses = (isSelected: boolean) => {
    const base = "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all";
    if (isSelected) {
      return cn(base, "bg-primary/10 border-primary");
    }
    switch (theme.mode) {
      case 'light':
        return cn(base, "border-slate-200 bg-slate-100/50 hover:bg-slate-200/40");
      case 'dark':
        return cn(base, "border-slate-800 bg-slate-950/40 hover:bg-slate-900/40");
      case 'glass':
        return cn(base, "border-white/5 bg-white/5 hover:bg-white/10");
      default:
        return cn(base, "border-border/50 bg-secondary/10 hover:bg-secondary/30");
    }
  };

  const commonInputClasses = getFieldBaseClasses();

  switch (field.type) {
    case 'shortText':
    case 'email':
    case 'number':
    case 'url':
      return (
        <Input 
          required={field.required}
          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
          placeholder={field.placeholder || "Enter your answer"}
          className={commonInputClasses}
          value={answers[field.id] || ''}
          onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
          style={{ borderRadius: theme.borderRadius }}
          min={field.validation?.min}
          max={field.validation?.max}
          pattern={field.validation?.pattern}
        />
      );
    case 'longText':
      return (
        <textarea
          required={field.required}
          className={cn(commonInputClasses, "min-h-[140px] py-4 resize-y leading-relaxed text-lg")}
          placeholder={field.placeholder || "Enter your detailed response"}
          value={answers[field.id] || ''}
          onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
          style={{ borderRadius: theme.borderRadius }}
        />
      );
    case 'radio':
      return (
        <div className="space-y-3">
          {(field.options || []).map((opt, i) => (
            <label 
              key={i} 
              className={getOptionClasses(answers[field.id] === opt)}
              style={{ borderRadius: theme.borderRadius }}
            >
              <input 
                type="radio" 
                name={field.id} 
                required={field.required}
                value={opt}
                checked={answers[field.id] === opt}
                onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
                className="w-5 h-5 accent-primary transition-all scale-110" 
              />
              <span className="text-lg font-medium text-foreground">{opt}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      const currentChecks = answers[field.id] || [];
      return (
        <div className="space-y-3">
          {(field.options || []).map((opt, j) => (
            <label 
              key={j} 
              className={getOptionClasses(currentChecks.includes(opt))}
              style={{ borderRadius: theme.borderRadius }}
            >
              <input 
                type="checkbox" 
                value={opt}
                checked={currentChecks.includes(opt)}
                onChange={(e) => {
                  const newChecks = e.target.checked 
                    ? [...currentChecks, opt]
                    : currentChecks.filter((c: any) => c !== opt);
                  setAnswers({...answers, [field.id]: newChecks});
                }}
                className="w-5 h-5 accent-primary rounded-md" 
              />
              <span className="text-lg font-medium text-foreground">{opt}</span>
            </label>
          ))}
        </div>
      );
    case 'dropdown':
      return (
        <div className="relative">
          <select 
            required={field.required}
            value={answers[field.id] || ''}
            onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
            className={`${commonInputClasses} appearance-none cursor-pointer`}
            style={{ borderRadius: theme.borderRadius }}
          >
            <option value="" disabled>Select an option</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt} className="bg-background text-foreground">{opt}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      );
    case 'date':
       return (
         <Input 
           required={field.required}
           type="date"
           className={commonInputClasses}
           value={answers[field.id] || ''}
           onChange={(e) => setAnswers({...answers, [field.id]: e.target.value})}
           style={{ borderRadius: theme.borderRadius }}
         />
       );
    case 'starRating':
      const rating = answers[field.id] || 0;
      return (
        <div className="flex items-center gap-3 py-2">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setAnswers({...answers, [field.id]: i})}
              onMouseEnter={() => {}} // Could add hover state if needed
              className="p-1 transition-transform active:scale-95"
            >
              <Star 
                className={cn(
                  "w-10 h-10 transition-all",
                  i <= rating ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : "text-muted-foreground/30 hover:text-yellow-400/50"
                )}
              />
            </button>
          ))}
        </div>
      );
    case 'image':
    case 'file':
    case 'video':
      return (
        <FileUploader 
          type={field.type as any}
          maxSizeMB={field.validation?.maxSizeMB}
          allowedTypes={field.validation?.allowedTypes}
          theme={theme}
          onUploadComplete={(blobId) => setAnswers({...answers, [field.id]: blobId})}
        />
      );
    default:
      return null;
  }
}
