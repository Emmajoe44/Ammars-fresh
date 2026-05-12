import { useRef } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { resolveImageSrc } from "@/lib/image-url";

interface ImageUploadProps {
  value?: string | null;
  onChange: (objectPath: string | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Product image" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload({
    getRequestHeaders: () => {
      const t = typeof window !== "undefined" ? localStorage.getItem("agrimarket_token") : null;
      const headers: Record<string, string> = {};
      if (t) headers.Authorization = `Bearer ${t}`;
      return headers;
    },
    onSuccess: (res) => onChange(res.objectPath),
  });

  const previewSrc = resolveImageSrc(value);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }
    await uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" data-testid="input-image" />
      {previewSrc ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted border border-border">
          <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" data-testid="img-preview" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background"
            data-testid="button-remove-image"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors disabled:opacity-60"
          data-testid="button-pick-image"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-6 h-6" />
              <span className="text-sm">Tap to choose an image</span>
              <span className="text-xs">JPG / PNG, max 5 MB</span>
            </>
          )}
        </button>
      )}
      {previewSrc && (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading} data-testid="button-replace-image">
          {isUploading ? "Uploading…" : "Replace image"}
        </Button>
      )}
    </div>
  );
}
