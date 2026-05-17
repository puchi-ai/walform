import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, X, Loader2, Paperclip, ImageIcon, Video } from 'lucide-react';
import { walrus } from '../services/walrus';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  type: 'image' | 'file' | 'video';
  maxSizeMB?: number;
  allowedTypes?: string[];
  onUploadComplete: (blobId: string) => void;
  theme: any;
}

export function FileUploader({ type, maxSizeMB = 10, allowedTypes, onUploadComplete, theme }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [blobId, setBlobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size too large (max ${maxSizeMB}MB)`);
      return;
    }

    if (allowedTypes && allowedTypes.length > 0) {
      const extension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
      if (!allowedTypes.includes(extension)) {
        setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        return;
      }
    }

    setError(null);
    setFile(selectedFile);
    await uploadFile(selectedFile);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(30);
    try {
      // 1. Read file as ArrayBuffer or Blob
      const buffer = await file.arrayBuffer();
      setProgress(60);

      // 2. Upload to S3 (via secure backend proxy)
      const id = await walrus.publishBlob(new Uint8Array(buffer));
      setProgress(100);

      setBlobId(id);
      onUploadComplete(id);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setBlobId(null);
    setError(null);
    setProgress(0);
  };

  const Icon = type === 'image' ? ImageIcon : type === 'video' ? Video : Paperclip;

  if (blobId) {
    return (
      <div 
        className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in zoom-in-95 duration-300"
        style={{ borderRadius: theme.borderRadius }}
      >
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-foreground">{file?.name}</p>
          <p className="text-[10px] font-mono text-muted-foreground truncate uppercase">{blobId}</p>
        </div>
        <button 
          onClick={clearFile}
          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "relative group p-10 border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden",
          uploading ? "border-primary/50 bg-primary/5" : "border-border/50 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/30"
        )}
        style={{ borderRadius: theme.borderRadius }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <span className="text-lg font-bold block mb-1">Securing & Uploading...</span>
              <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
              <Icon className="w-8 h-8" />
            </div>
            <div className="text-center">
              <span className="text-lg font-bold block mb-1">Click to Upload {type === 'video' ? 'Video' : 'File'}</span>
              <span className="text-sm text-muted-foreground">Maximum size: {maxSizeMB}MB</span>
            </div>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              accept={allowedTypes?.join(',')}
            />
          </>
        )}
      </div>
      
      {error && (
        <p className="text-xs font-bold text-destructive animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
