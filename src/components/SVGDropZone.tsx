import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface SVGDropZoneProps {
  onSVGLoaded: (svgString: string) => void;
}

const SVGDropZone: React.FC<SVGDropZoneProps> = ({ onSVGLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) onSVGLoaded(text);
    };
    reader.readAsText(file);
  }, [onSVGLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg,image/svg+xml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed 
        cursor-pointer transition-all duration-200 p-12
        ${isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-border hover:border-muted-foreground hover:bg-surface-hover'
        }
      `}
    >
      <Upload className="h-10 w-10 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Drop your SVG logo here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
      </div>
    </div>
  );
};

export default SVGDropZone;
