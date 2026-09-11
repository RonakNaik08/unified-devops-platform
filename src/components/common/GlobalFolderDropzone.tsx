import React, { useState, useEffect } from 'react';
import { FolderGit2, UploadCloud, Sparkles, FolderUp, CheckCircle2 } from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface GlobalFolderDropzoneProps {
  onWorkspaceImported?: (projectId: string) => void;
}

export const GlobalFolderDropzone: React.FC<GlobalFolderDropzoneProps> = ({
  onWorkspaceImported
}) => {
  const { registerProject, scanProjectFolder } = useDevSecOps();
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropStatus, setDropStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        setDragCounter(prev => prev + 1);
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragCounter(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsDragging(false);
          return 0;
        }
        return next;
      });
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setDragCounter(0);

      if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
        return;
      }

      setIsProcessing(true);
      setDropStatus('Scanning dropped project directory...');

      let detectedPath = '';

      // 1. Check direct file path (Electron / Chromium desktop drop)
      const firstFile = e.dataTransfer.files[0] as any;
      if (firstFile.path) {
        detectedPath = firstFile.path;
      } else if (firstFile.webkitRelativePath) {
        const rootDir = firstFile.webkitRelativePath.split('/')[0];
        detectedPath = `/Users/ronak/Desktop/${rootDir}`;
      }

      // 2. Check DataTransferItemList webkit entries
      if (!detectedPath && e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i];
          if (item.kind === 'file') {
            const entry = (item as any).webkitGetAsEntry?.();
            if (entry) {
              detectedPath = `/Users/ronak/Desktop/${entry.name}`;
              break;
            }
          }
        }
      }

      // 3. Fallback
      if (!detectedPath) {
        const name = firstFile.name || 'Projectt';
        detectedPath = `/Users/ronak/Desktop/${name}`;
      }

      try {
        setDropStatus(`Inspecting Git & Stack for: ${detectedPath}...`);
        const scanRes = await scanProjectFolder(detectedPath);
        
        const projName = scanRes.name || detectedPath.split('/').pop() || 'Imported Workspace';
        const projDesc = scanRes.description || `Imported folder via drag & drop`;

        const newProject = await registerProject(detectedPath, projName, projDesc);

        if (onWorkspaceImported && newProject) {
          onWorkspaceImported(newProject.id);
        }
      } catch (err: any) {
        console.error('Folder drop error:', err);
      } finally {
        setIsProcessing(false);
        setDropStatus(null);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [scanProjectFolder, registerProject, onWorkspaceImported]);

  if (!isDragging && !isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-8 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl p-10 rounded-3xl border-3 border-dashed border-blue-400 bg-[#0d1627]/90 text-white shadow-2xl shadow-blue-500/30 flex flex-col items-center justify-center text-center space-y-5 animate-scale-up">
        {/* Glowing Animated Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/40 animate-pulse">
            <UploadCloud className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">
            {isProcessing ? 'Importing & Analyzing Workspace...' : 'Drop Local Project Folder Anywhere'}
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {dropStatus || 'Drop your local repository or folder directly into DevOpsHub to auto-detect tech stack, Dockerfiles, and K8s configuration.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5" /> Auto Git Detection
          </span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dockerfile Scanner
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5">
            <FolderUp className="w-3.5 h-3.5" /> Instant Workspace Switch
          </span>
        </div>
      </div>
    </div>
  );
};
