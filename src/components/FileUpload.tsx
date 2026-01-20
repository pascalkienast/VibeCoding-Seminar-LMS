"use client";
import { useState, useRef, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export interface UploadedFile {
  id?: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  bucketName?: string;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function FileUpload({
  files,
  onFilesChange,
  bucketName = "qa-files",
  maxFiles = 5,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Nicht eingeloggt");
      return null;
    }

    // Create unique file path: userId/timestamp-filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${userData.user.id}/${timestamp}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
    };
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setError(null);
    const filesToUpload = Array.from(fileList);

    // Validate file count
    if (files.length + filesToUpload.length > maxFiles) {
      setError(`Maximal ${maxFiles} Dateien erlaubt`);
      return;
    }

    // Validate file sizes
    const maxBytes = maxSizeMB * 1024 * 1024;
    for (const file of filesToUpload) {
      if (file.size > maxBytes) {
        setError(`Datei "${file.name}" ist zu groß (max. ${maxSizeMB}MB)`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadedFiles: UploadedFile[] = [];
      for (const file of filesToUpload) {
        const result = await uploadFile(file);
        if (result) {
          uploadedFiles.push(result);
        }
      }
      onFilesChange([...files, ...uploadedFiles]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [files, maxFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const getFileIcon = (type?: string) => {
    if (!type) return "📄";
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📕";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    return "📄";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
          }
          ${uploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        <div className="text-neutral-500 dark:text-neutral-400">
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Lädt hoch...
            </span>
          ) : (
            <>
              <span className="text-2xl block mb-2">📎</span>
              <span>Dateien hierher ziehen oder klicken zum Auswählen</span>
              <span className="block text-sm mt-1">
                Max. {maxFiles} Dateien, je max. {maxSizeMB}MB
              </span>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
          ⚠️ {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
            >
              <span className="text-xl">{getFileIcon(file.file_type)}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {file.file_name}
                </a>
                {file.file_size && (
                  <span className="text-xs text-neutral-500">
                    {formatFileSize(file.file_size)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Entfernen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Component to display attachments (read-only)
export function AttachmentList({ files }: { files: UploadedFile[] }) {
  if (!files || files.length === 0) return null;

  const getFileIcon = (type?: string) => {
    if (!type) return "📄";
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📕";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    return "📄";
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {files.map((file, index) => (
        <a
          key={index}
          href={file.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <span>{getFileIcon(file.file_type)}</span>
          <span className="max-w-[150px] truncate">{file.file_name}</span>
        </a>
      ))}
    </div>
  );
}


