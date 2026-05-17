import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormStore, FormSubmission, FormField } from '../store/useFormStore';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
  Flag,
  MessageSquare,
  Clock,
  Archive,
  CheckCircle,
  X,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadForm, currentForm, updateSubmission, fetchFormResponses } = useFormStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadForm(id);
      fetchFormResponses(id).then((data) => {
        if (data) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            formId: id,
            data: item.answers,
            submittedAt: item.createdAt,
            status: item.status || 'unread',
            priority: item.priority || 'medium',
            notes: item.notes || ''
          }));
          setSubmissions(mapped);
        }
      });
    }
  }, [id, loadForm, fetchFormResponses]);

  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    if (searchTerm) {
      result = result.filter(sub => 
        JSON.stringify(sub.data).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(sub => sub.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      result = result.filter(sub => sub.priority === filterPriority);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = sortConfig.key === 'submittedAt' ? a.submittedAt : (a.data[sortConfig.key] || '');
        const bVal = sortConfig.key === 'submittedAt' ? b.submittedAt : (b.data[sortConfig.key] || '');
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [submissions, searchTerm, sortConfig]);

  const selectedSubmission = submissions.find(s => s.id === selectedSubId);

  const handleUpdateSubmission = (subId: string, updates: Partial<FormSubmission>) => {
    if (id) {
      updateSubmission(id, subId, updates);
      setSubmissions(current => current.map(sub => sub.id === subId ? { ...sub, ...updates } : sub));
    }
  };

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const toggleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key && current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const exportToCSV = () => {
    if (!currentForm || filteredSubmissions.length === 0) return;

    const headers = [
      'Submission ID',
      'Date',
      ...currentForm.fields.filter(f => f.type !== 'section' && f.type !== 'pageBreak').map(f => f.label)
    ];

    const rows = filteredSubmissions.map(sub => [
      sub.id,
      format(new Date(sub.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
      ...currentForm.fields
        .filter(f => f.type !== 'section' && f.type !== 'pageBreak')
        .map(f => `"${sub.data[f.id] || ''}"`)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentForm.title}_submissions_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentForm) return null;

  const activeFields = currentForm.fields.filter(f => f.type !== 'section' && f.type !== 'pageBreak');

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <header className="h-16 border-b px-6 flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-bold tracking-tight flex items-center gap-2">
              {currentForm.title} <span className="text-muted-foreground font-normal">/</span> <span className="text-primary">Results</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {submissions.length} Total Submissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 gap-2" onClick={exportToCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              placeholder="Search in responses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-secondary/20 border-none ring-offset-background selection:bg-primary/30"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-11 px-4 rounded-2xl bg-secondary/40 gap-2")}>
                <Filter className="w-4 h-4" /> 
                <span className="hidden sm:inline">Status: {filterStatus}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('unread')}>Unread</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('read')}>Read</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('archive')}>Archived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-11 px-4 rounded-2xl bg-secondary/40 gap-2")}>
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline">Priority: {filterPriority}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterPriority('all')}>All Priorities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('high')}>High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('medium')}>Medium</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('low')}>Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-xs font-bold text-muted-foreground/60 hidden md:block ml-2">
              Showing {filteredSubmissions.length} of {submissions.length}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 border rounded-[2rem] bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30 border-b">
                <tr>
                  <th className="p-4 w-12 text-center text-[10px] font-black uppercase text-muted-foreground tracking-tighter">#</th>
                  <th 
                    className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors whitespace-nowrap min-w-[180px]"
                    onClick={() => toggleSort('submittedAt')}
                  >
                    <div className="flex items-center gap-2">
                       Submission Date <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Status & Priority
                  </th>
                  {activeFields.map(field => (
                    <th 
                      key={field.id}
                      className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors whitespace-nowrap min-w-[200px]"
                      onClick={() => toggleSort(field.id)}
                    >
                      <div className="flex items-center gap-2">
                        {field.label} <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  ))}
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub, index) => (
                    <tr 
                      key={sub.id} 
                      className={cn(
                        "hover:bg-secondary/10 group transition-colors cursor-pointer",
                        sub.status === 'unread' ? 'bg-primary/[0.02]' : ''
                      )}
                      onClick={() => setSelectedSubId(sub.id)}
                    >
                      <td className="p-4 text-center text-xs font-mono text-muted-foreground/50">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {format(new Date(sub.submittedAt), 'MMM d, yyyy')}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {format(new Date(sub.submittedAt), 'HH:mm:ss')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-bold uppercase",
                            sub.status === 'unread' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-500/10 text-slate-500'
                          )}>
                            {sub.status || 'read'}
                          </Badge>
                          <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", getPriorityColor(sub.priority))}>
                            {sub.priority || 'none'}
                          </Badge>
                        </div>
                      </td>
                      {activeFields.map(field => (
                        <td key={field.id} className="p-4 text-sm text-foreground/80 max-w-xs truncate font-medium">
                          {sub.data[field.id] || <span className="text-muted-foreground/30 italic">No response</span>}
                        </td>
                      ))}
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity")}>
                             <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <ShieldCheck className="w-4 h-4" /> Verify Seal Proof
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Database className="w-4 h-4" /> View Walrus Blob
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeFields.length + 4} className="p-24 text-center">
                       <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-30">
                          <Database className="w-16 h-16" />
                          <p className="text-lg font-bold">No entries found matching your search</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer / Pagination */}
          <div className="mt-auto border-t p-4 flex items-center justify-between bg-secondary/10">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Secured by Walrus Network
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-xs font-bold px-4">Page 1 of 1</div>
               <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Submission Detail Modal */}
      <Dialog open={!!selectedSubId} onOpenChange={(open) => !open && setSelectedSubId(null)}>
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-[2.5rem] border-border/50 shadow-2xl">
          <DialogHeader className="p-6 border-b shrink-0 bg-secondary/10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black tracking-tighter">Submission Details</DialogTitle>
                <DialogDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  ID: {selectedSubmission?.id} • Submitted {selectedSubmission && format(new Date(selectedSubmission.submittedAt), 'PPP p')}
                </DialogDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className={getPriorityColor(selectedSubmission?.priority)}>
                  {selectedSubmission?.priority?.toUpperCase() || 'NORMAL'} PRIORITY
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Data */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Database className="w-3 h-3" /> Response Data
                </h4>
                <div className="space-y-4">
                  {currentForm.fields.filter(f => f.type !== 'section' && f.type !== 'pageBreak').map(field => (
                    <div key={field.id} className="space-y-1 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">{field.label}</Label>
                      <div className="text-sm font-medium text-foreground break-words whitespace-pre-wrap">
                        {field.type === 'starRating' ? (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className={cn("w-4 h-4", i <= (selectedSubmission?.data[field.id] || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")} />
                            ))}
                          </div>
                        ) : selectedSubmission?.data[field.id] || <span className="text-muted-foreground/30 italic">No response</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review / Feedback Section */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Review & Internal Notes
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Priority Level</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map(p => (
                        <Button 
                          key={p} 
                          variant={selectedSubmission?.priority === p ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "rounded-xl h-10 font-bold text-[10px] uppercase",
                            selectedSubmission?.priority === p ? 'bg-primary shadow-lg' : 'hover:border-primary/50'
                          )}
                          onClick={() => selectedSubmission && handleUpdateSubmission(selectedSubmission.id, { priority: p as any })}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Internal Notes</Label>
                    <textarea 
                      className="w-full min-h-[150px] p-4 rounded-2xl bg-secondary/30 border-border/50 focus:border-primary/50 focus:ring-4 ring-primary/5 outline-none text-sm transition-all resize-none"
                      placeholder="Add notes about this feedback..."
                      value={selectedSubmission?.notes || ''}
                      onChange={(e) => selectedSubmission && handleUpdateSubmission(selectedSubmission.id, { notes: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Status</Label>
                      <p className="text-[10px] text-muted-foreground">Mark as processed</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-9 px-3 rounded-lg text-xs font-bold", selectedSubmission?.status === 'read' ? 'bg-green-500/10 text-green-500' : 'text-muted-foreground')}
                        onClick={() => selectedSubmission && handleUpdateSubmission(selectedSubmission.id, { status: 'read' })}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Done
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-9 px-3 rounded-lg text-xs font-bold", selectedSubmission?.status === 'archive' ? 'bg-slate-500/10 text-slate-500' : 'text-muted-foreground')}
                        onClick={() => selectedSubmission && handleUpdateSubmission(selectedSubmission.id, { status: 'archive' })}
                      >
                        <Archive className="w-4 h-4 mr-1" /> Archive
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t shrink-0 bg-secondary/5">
            <Button variant="ghost" onClick={() => setSelectedSubId(null)} className="rounded-xl h-11 px-8 font-bold">
              Close Detail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
