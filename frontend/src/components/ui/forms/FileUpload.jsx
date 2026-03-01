import React, { useRef, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { formatFileSize } from '@/utils/formatters';

const FileUpload = ({ 
  accept = { "image/*": [], "application/pdf": [] }, 
  maxSize = 5 * 1024 * 1024, // 5MB default
  onChange, 
  value,
  error,
  className 
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    // Basic validation logic
    if (file.size > maxSize) {
      alert(`File too large. Max size is ${formatFileSize(maxSize)}`);
      return;
    }
    onChange(file);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed transition-colors cursor-pointer p-6",
          isDragging ? "border-primary bg-primary-subtle" : "border-border-strong hover:bg-background-muted",
          error ? "border-danger bg-danger-subtle" : "",
          value ? "border-success bg-success-subtle" : ""
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={Object.keys(accept).join(',')}
          onChange={handleFileSelect}
        />

        {value ? (
          <div className="flex items-center w-full gap-3">
            <div className="p-2 rounded-full bg-background shrink-0">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-content">{value.name}</p>
              <p className="text-xs text-content-muted">{formatFileSize(value.size)}</p>
            </div>
            <button 
              onClick={removeFile}
              className="p-1 transition-colors rounded-full hover:bg-background-muted"
            >
              <X className="w-5 h-5 text-content-muted hover:text-danger" />
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 rounded-full bg-background-muted">
              <UploadCloud className="w-6 h-6 text-content-muted" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-primary">Click to upload</span>
              <span className="text-content-muted"> or drag and drop</span>
            </div>
            <p className="text-xs text-content-muted">
              SVG, PNG, JPG or PDF (max {formatFileSize(maxSize)})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;